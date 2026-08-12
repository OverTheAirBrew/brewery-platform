'use strict';

import { Client, PublishPacket, Subscription } from 'aedes';
import { generateHashPassword, verifyPassword } from './hasher';
import { minimatch } from 'minimatch';
const defaultGlob: string[] = [];

export type User = {
  salt: string;
  hash: string;
  authorizePublish: string[];
  authorizeSubscribe: string[];
};

export type Users = Record<string, User>;

type LocalClient = Client & { user?: string };

export class Authorizer {
  public readonly users: Users;

  constructor(users: Users) {
    this.users = users;
  }

  public authenticate(
    client: LocalClient,
    user: Readonly<string | undefined>,
    pass: Buffer<ArrayBufferLike> | undefined,
    cb: Function,
  ) {
    const missingUser = !user || !pass || !this.users[user];

    if (missingUser) {
      cb(null, false);
      return;
    }

    user = user!.toString();

    client.user = user;
    const currentUser = this.users[user];

    if (!currentUser) {
      cb(null, false);
      return;
    }

    verifyPassword(currentUser, pass.toString())
      .then((success) => cb(null, success))
      .catch((err) => {
        cb(err);
      });
  }

  public authorizePublish(
    client: LocalClient | null,
    packet: PublishPacket,
    cb: Function,
  ) {
    if (!client || !client.user) {
      cb(new Error('Client not authenticated'));
      return;
    }

    const authorized = this.users[client.user].authorizePublish
      .map((pattern) => minimatch(packet.topic, pattern))
      .some((result) => result === true);

    console.log(
      'Client %s PUBLISH %s on %s',
      client.id,
      packet.payload.toString(),
      packet.topic,
    );

    cb(authorized ? null : Error('Publish not authorized'));
  }

  public authorizeSubscribe(
    client: LocalClient,
    sub: Subscription,
    done: Function,
  ) {
    if (!client || !client.user) {
      done(new Error('Client not authenticated'));
      return;
    }

    const authorized = this.users[client.user].authorizeSubscribe
      .map((pattern) => minimatch(sub.topic, pattern))
      .some((result) => result === true);

    console.log('Client %s SUBSCRIBE %s on %s', client.id, sub.topic, sub.qos);

    done(null, authorized ? sub : null);
  }

  public async addUser(
    user: string,
    pass: string,
    authorizePublish: string[],
    authorizeSubscribe: string[],
  ) {
    if (!authorizePublish) {
      authorizePublish = defaultGlob;
    }

    if (!authorizeSubscribe) {
      authorizeSubscribe = defaultGlob;
    }

    const { salt, hash } = await generateHashPassword(pass.toString());

    const exists = this.users[user];

    this.users[user] = {
      salt,
      hash,
      authorizePublish,
      authorizeSubscribe,
    };

    return exists;
  }

  public updateAuthorizePublishSubscribe(
    user: string,
    authorizePublish: string[],
    authorizeSubscribe: string[],
  ) {
    const exists = this.users[user];

    if (!exists) {
      throw new Error(`User ${user} does not exist`);
    }

    if (!authorizePublish) {
      authorizePublish = exists.authorizePublish;
    }

    if (!authorizeSubscribe) {
      authorizeSubscribe = exists.authorizeSubscribe;
    }

    this.users[user].authorizePublish = [
      ...new Set([...exists.authorizePublish, ...authorizePublish]),
    ];

    this.users[user].authorizeSubscribe = [
      ...new Set([...exists.authorizeSubscribe, ...authorizeSubscribe]),
    ];

    return exists;
  }

  public rmUser(user: string) {
    const exists = this.users[user];
    delete this.users[user];

    return exists;
  }
}
