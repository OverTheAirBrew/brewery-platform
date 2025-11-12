'use strict';
import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { Authorizer, User, Users } from './authorizer';
import { createServer as createNetServer, Server as NetServer } from 'net';
import { Aedes, AedesOptions, PublishPacket } from 'aedes';
import { initLogger } from './logger';
import { initPersistence } from './persistence';
import { credentialsFile } from './file-location';

async function loadAuthorizer(create: boolean = false) {
  let authorizer: Authorizer | null = null;

  if (credentialsFile) {
    let data: Users;
    try {
      const fileData = await readFile(credentialsFile);
      data = JSON.parse(fileData.toString()) as Users;
    } catch (error) {
      console.log(
        'unable to load credentials file: %s',
        credentialsFile,
        (error as any).message,
      );
      if (create) {
        console.log('creating NEW credentials file %s', credentialsFile);
        data = {};
      } else {
        return null;
      }
    }

    authorizer = new Authorizer(data);
  }

  return authorizer;
}

/**
 * Servers factory
 *
 * @api private
 * @param {String} protocol the protocol
 * @param {Object} options options for secure protocols
 * @param {Aedes.handle} handle Aedes handle
 * @param {Function} done callback
 */
async function createServer(
  protocol: string,
  host: string,
  port: number,
  options: any,
  handle: any,
) {
  let server = createNetServer(handle);

  // server.once('error', reject);
  server.listen(port, host, () => {
    // server.removeListener('error', reject);
    console.log(
      '%s server listening on port %s:%d',
      protocol.toUpperCase(),
      host,
      port,
    );
    // resolve(server);
  });

  return server;

  // }
}

/**
 * Allows broker to handle websockets connections
 *
 * @param {http.Server|https.Server} server Http/Https server
 * @param {Aedes.handle} handle Broker handle function
 */
// function startWebsocket(server, handle) {
//   const ws = new WebSocket.Server({ server });
//   ws.on('connection', function (conn, req) {
//     handle(WebSocket.createWebSocketStream(conn), req);
//   });
// }

type Config = {
  host: string;

  port: number;
  wsPort: number;
  wssPort: number;
  tlsPort: number;
  protos: ('tcp' | 'tls' | 'ws' | 'wss')[];

  verbose?: boolean;
  veryVerbose?: boolean;
  noPretty?: boolean;

  brokerId: string;
};

export async function start(config: Config) {
  const ports = {
    tcp: config.port,
    ws: config.wsPort,
    tls: config.tlsPort,
    wss: config.wssPort,
  };

  const serverOpts = {};

  // const isSecure =
  //   config.protos.indexOf('tls') >= 0 || config.protos.indexOf('wss') >= 0;

  // if (isSecure) {
  //   if (config.cert && config.key) {
  //     serverOpts.key = await readFile(config.key);
  //     serverOpts.cert = await readFile(config.cert);
  //     serverOpts.rejectUnauthorized = config.rejectUnauthorized;
  //   } else {
  //     throw new Error(
  //       'Must supply both private key and signed certificate to create secure aedes server',
  //     );
  //   }
  // }

  // LOGGER ------------

  const loggerOpts: { level?: string; pretty?: boolean } = {};

  if (config.verbose) {
    loggerOpts.level = 'verbose';
  } else if (config.veryVerbose) {
    loggerOpts.level = 'debug';
  }

  loggerOpts.pretty = !config.noPretty;

  const logger = initLogger(loggerOpts);

  // BROKER ------------
  const { persistence, mq } = await initPersistence(config);

  const aedesOpts: AedesOptions = {
    persistence,
    mq,
  };

  // aedesOpts.concurrency = config.concurrency || 1;
  // aedesOpts.queueLimit = config.queueLimit;
  // aedesOpts.maxClientsIdLength = config.maxClientsIdLength;
  // aedesOpts.heartbeatInterval = config.heartbeatInterval;
  // aedesOpts.connectTimeout = config.connectTimeout;
  aedesOpts.id = config.brokerId;

  const broker = await Aedes.createBroker(aedesOpts);

  broker.on('subscribe', function (subscriptions, client) {
    logger.info(
      'Client \x1b[32m%s\x1b[0m SUBSCRIBED to: %s, broker %s',
      client ? client.id : client,
      subscriptions.map((s) => s.topic).join('\n'),
      broker.id,
    );
  });

  broker.on('unsubscribe', function (subscriptions, client) {
    logger.info(
      'Client \x1b[32m%s\x1b[0m UNSUBSCRIBED to: %s, broker %s',
      client ? client.id : client,
      subscriptions.map((s) => s).join('\n'),
      broker.id,
    );
  });

  // fired when a client connects
  broker.on('client', function (client) {
    logger.info(
      'Client \x1b[33m%s\x1b[0m CONNECTED, broker %s',
      client ? client.id : client,
      broker.id,
    );
  });

  // emitted when the client has received all its offline messages and be initialized
  broker.on('clientReady', function (client) {
    logger.info(
      'Client \x1b[33m%s\x1b[0m READY, broker %s',
      client ? client.id : client,
      broker.id,
    );
  });

  // emitted when an error occurs
  broker.on('clientError', function (client, error) {
    logger.error(
      'Client \x1b[33m%s\x1b[0m ERROR: %s, broker %s',
      client ? client.id : client,
      error.message,
      broker.id,
    );
  });

  // like clientError but raises only when client is uninitialized
  broker.on('connectionError', function (client, error) {
    logger.error(
      'Client \x1b[33m%s\x1b[0m ERROR: %s, broker %s',
      client ? client.id : client,
      error.message,
      broker.id,
    );
  });

  // fired when timeout happes in the client keepalive.
  broker.on('keepaliveTimeout', function (client) {
    logger.error(
      'Client \x1b[33m%s\x1b[0m KEEPALIVE timeout, broker %s',
      client ? client.id : client,
      broker.id,
    );
  });

  // QoS 1 or 2 acknowledgement when the packet successfully delivered to the client
  broker.on('ack', function (packet, client) {
    logger.debug(
      'ACK of %s received from client \x1b[33m%s\x1b[0m, broker %s',
      packet ? (packet as PublishPacket).topic : packet,
      client ? client.id : client,
      broker.id,
    );
  });

  // when client sends a PINGREQ
  broker.on('ping', function (packet, client) {
    logger.debug(
      'PINGREQ received from client \x1b[33m%s\x1b[0m, broker %s',
      client ? client.id : client,
      broker.id,
    );
  });

  // when server sends a CONNACK to client
  broker.on('connackSent', function (packet, client) {
    logger.debug(
      'CONNACK sent to \x1b[33m%s\x1b[0m, broker %s',
      client ? client.id : client,
      broker.id,
    );
  });

  // fired when a client disconnects
  broker.on('clientDisconnect', function (client) {
    logger.info(
      'Client \x1b[33m%s\x1b[0m DISCONNECTED, broker %s',
      client ? client.id : client,
      broker.id,
    );
  });

  // fired when a message is published
  broker.on('publish', function (packet, client) {
    logger.info(
      'Client \x1b[31m%s\x1b[0m PUBLISH %s on %s, broker %s',
      client ? client.id : 'BROKER_' + broker.id,
      packet.payload.toString(),
      packet.topic,
      broker.id,
    );
  });

  // broker authorizer
  const setupAuthorizer = async function () {
    process.on('SIGHUP', setupAuthorizer);
    broker.on('closed', function () {
      process.removeListener('SIGHUP', setupAuthorizer);
    });

    const authorizer = await loadAuthorizer(false);

    if (authorizer) {
      broker.authenticate = authorizer.authenticate.bind(authorizer);
      broker.authorizeSubscribe =
        authorizer.authorizeSubscribe.bind(authorizer);
      broker.authorizePublish = authorizer.authorizePublish.bind(authorizer);
    }

    return authorizer;
  };

  await setupAuthorizer();

  // STATS ------------

  // if (config.stats) {
  //   stats(broker, { interval: config.statsInterval });
  // }

  // SERVERS ------------

  const servers: NetServer[] = [];

  for (const p of config.protos) {
    servers.push(
      await createServer(p, config.host, ports[p], serverOpts, broker.handle),
    );
  }

  return { servers, broker, persistence, mq, logger };
}
function saveAuthorizer(authorizer: Authorizer) {
  return writeFile(credentialsFile, JSON.stringify(authorizer.users, null, 2));
}

export async function adduser(
  user: string,
  password: string,
  authorizePublish: string[],
  authorizeSubscribe: string[],
) {
  const authorizer = await loadAuthorizer(true);
  if (!authorizer) {
    throw Error(
      'you must specify a valid credential file using --credentials option',
    );
  }
  const exists = await authorizer.addUser(
    user,
    password,
    authorizePublish,
    authorizeSubscribe,
  );
  await saveAuthorizer(authorizer);
  console.log('User %s successfully %s', user, exists ? 'MODIFIED' : 'CREATED');
  return { user, exists };
}

export async function updateAutorizePublishSubscribe(
  user: string,
  authorizePublish: string[],
  authorizeSubscribe: string[],
) {
  const authorizer = await loadAuthorizer(false);
  if (!authorizer) {
    throw Error(
      'you must specify a valid credential file using --credentials option',
    );
  }
  const exists = authorizer.updateAuthorizePublishSubscribe(
    user,
    authorizePublish,
    authorizeSubscribe,
  );

  await saveAuthorizer(authorizer);
  console.log(
    'User %s successfully %s',
    user,
    exists ? 'MODIFIED' : "doesn't exists",
  );
  return { user, exists };
}

// export async function rmuser(user: string) {
//   const username = user;
//   const authorizer = await loadAuthorizer(false);
//   if (!authorizer) {
//     throw Error(
//       'you must specify a valid credential file using --credentials option',
//     );
//   }
//   const exists = authorizer.rmUser(username);
//   await saveAuthorizer(authorizer, program);
//   console.log(
//     'User %s %s',
//     username,
//     exists ? 'successfully REMOVED' : "doesn't exists",
//   );
//   return { username, exists };
// }
