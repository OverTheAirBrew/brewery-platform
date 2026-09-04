import 'dotenv/config';
import { Aedes } from 'aedes';
import { randomUUID } from 'crypto';

import { start, adduser, updateAutorizePublishSubscribe } from './lib';
import { existsSync, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { credentialsFile } from './lib/file-location';

const USERNAME = 'bpmqttuseradmin';

async function createUser(user: {
  username: string;
  password?: string;
  authorizeSubscribe: string[];
  authorizePublish: string[];
}) {
  const password = user.password || randomUUID();
  await adduser(
    user.username,
    password,
    user.authorizePublish,
    user.authorizeSubscribe,
  );

  if (!user.password) {
    console.log(`Creating user '${user.username}': ${password}.`);
  } else {
    console.log(`Creating user '${user.username}'.`);
  }

  process.emit('SIGHUP');
}

(async () => {
  if (!existsSync(credentialsFile)) {
    console.log(
      `Credentials file ${credentialsFile} does not exist. Creating an empty one.`,
    );
    writeFileSync(credentialsFile, JSON.stringify({}));
  }

  const loadedCredentials = JSON.parse(
    await readFile(credentialsFile, 'utf-8'),
  );

  console.log(`Loaded credentials from ${credentialsFile}:`, loadedCredentials);

  const { broker } = await start({
    protos: ['tcp'],
    host: '0.0.0.0',
    port: 1883,
    wsPort: 3000,
    wssPort: 4000,
    tlsPort: 8883,
    brokerId: 'aedes-cli',
    // credentials: credentialsFile,
    // persistence: {
    //   name: 'mongodb',
    //   options: {
    //     url: 'mongodb://127.0.0.1/aedes',
    //     // mongoOptions: {
    //     //   auth: {
    //     //     user: 'root',
    //     //     password: 'example'
    //     //   }
    //     // },
    //   },
    // },
    // mq: {
    //   name: 'mongodb',
    //   options: {
    //     url: 'mongodb://127.0.0.1/aedes',
    //     // mongoOptions: {
    //     //   auth: {
    //     //     user: 'root',
    //     //     password: 'example'
    //     //   }
    //     // },
    //   },
    // },
    // key: null,
    // cert: null,
    // rejectUnauthorized: true,
    verbose: false,
    veryVerbose: false,
    noPretty: false,
  });

  if (!loadedCredentials[USERNAME]) {
    await createUser({
      username: USERNAME,
      password: process.env.ADMIN_PASSWORD || undefined,
      authorizeSubscribe: ['**'],
      authorizePublish: ['platform/mqtt-server/add-user'],
    });
  }

  const aedesBroker: Aedes = broker;

  aedesBroker.on('publish', async (packet, client) => {
    const cl: { user: string | undefined } = client as unknown as {
      user: string | undefined;
    };
    if (cl?.user === USERNAME) {
      if (packet.topic === 'platform/mqtt-server/add-user') {
        try {
          const parsedBuffer = Buffer.from(packet.payload).toString('utf-8');
          const { data } = JSON.parse(parsedBuffer);

          await createUser({
            username: data.username,
            password: data.password,
            authorizeSubscribe: data.authorizeSubscribe || [],
            authorizePublish: data.authorizePublish || [],
          });
        } catch (err) {
          console.error('Error processing add-user message', err);
        }

        return;
      }

      if (
        packet.topic ===
        'platform/mqtt-server/update-authorize-publish-subscribe'
      ) {
        try {
          const parsedBuffer = Buffer.from(packet.payload).toString('utf-8');
          const { data } = JSON.parse(parsedBuffer);

          await updateAutorizePublishSubscribe(
            data.username,
            data.authorizePublish,
            data.authorizeSubscribe,
          );
        } catch (err) {
          console.error(
            'Error processing update-authorize-publish-subscribe message',
            err,
          );
        }
      }
    }
  });
})();
