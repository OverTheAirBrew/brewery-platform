#!/usr/bin/env python3
"""Hardware-free MQTT integration contract test using Testcontainers.

The test owns an ephemeral Mosquitto broker: Docker selects an unused host port,
and the broker is stopped and removed when the test exits.
"""
import json
import os
import threading
import time
import uuid

import paho.mqtt.client as mqtt
from testcontainers.core.container import DockerContainer

DEVICE_ID = "ci-device-id"
SENSOR_ID = "ci-sensor-id"
TOPIC = f"ftss/{DEVICE_ID}/sensor/{SENSOR_ID}/reading"
ACTOR_TOPIC = f"ftss/{DEVICE_ID}/actor/switch"
TEST_TOPIC = "platform/test-connection"


def run_contract_test(host: str, port: int) -> None:
    received = []
    ready = threading.Event()

    def on_connect(client, userdata, flags, reason_code, properties=None):
        if reason_code == 0:
            client.subscribe([(TOPIC, 0), (ACTOR_TOPIC, 0), (TEST_TOPIC, 0)])
            ready.set()

    def on_message(client, userdata, message):
        received.append((message.topic, message.payload.decode("utf-8")))

    observer = mqtt.Client(
        mqtt.CallbackAPIVersion.VERSION2, client_id=f"ci-observer-{uuid.uuid4()}"
    )
    observer.on_connect = on_connect
    observer.on_message = on_message
    observer.connect(host, port, keepalive=30)
    observer.loop_start()

    publisher = mqtt.Client(
        mqtt.CallbackAPIVersion.VERSION2, client_id=f"ci-controller-{uuid.uuid4()}"
    )
    publisher.loop_start()

    try:
        assert ready.wait(10), "Testcontainers broker did not accept the test observer"
        publisher.connect(host, port, keepalive=30)
        time.sleep(0.2)

        # This mirrors the configuration-derived firmware contract after a
        # successful DS18B20 conversion. The broker is real, but no Pico or
        # physical thermometer/relay hardware is needed.
        payload = json.dumps({"payload": {"value": 23.45}}, separators=(",", ":"))
        assert publisher.publish(TOPIC, payload, retain=True).wait_for_publish()
        assert publisher.publish(
            ACTOR_TOPIC, json.dumps({"actor_id": "heater-ci", "state": "on"})
        ).wait_for_publish()
        assert publisher.publish(TEST_TOPIC, json.dumps({"controller_id": DEVICE_ID})).wait_for_publish()

        limit = time.time() + 5
        while len(received) < 3 and time.time() < limit:
            time.sleep(0.05)

        by_topic = dict(received)
        assert TOPIC in by_topic, "Temperature topic was not received"
        message = json.loads(by_topic[TOPIC])
        assert message == {"payload": {"value": 23.45}}, (
            "Temperature payload must use payload.value in Celsius"
        )
        assert isinstance(message["payload"]["value"], (int, float)), (
            "payload.value must be numeric"
        )
        assert ACTOR_TOPIC in by_topic, "Configured actor topic was not received"
        assert TEST_TOPIC in by_topic, "Protected test topic was not received"
    finally:
        publisher.loop_stop()
        publisher.disconnect()
        observer.loop_stop()
        observer.disconnect()


# Testcontainers creates a dedicated Docker network/container and maps MQTT to
# a free host port. with_bind_ports is deliberately not used, so concurrent CI
# runs cannot collide on a fixed port.
with DockerContainer("eclipse-mosquitto:2").with_exposed_ports(1883) as broker:
    broker_host = broker.get_container_host_ip()
    broker_port = int(broker.get_exposed_port(1883))
    run_contract_test(broker_host, broker_port)

print("Testcontainers MQTT broker contract test passed.")