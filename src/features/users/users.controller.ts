import { type FastifyReply, type FastifyRequest } from 'fastify';

import { exhaustive } from 'exhaustive';
import autoBind from 'auto-bind';

import { E, pipe } from '@shared/effect';

import {
  createUserPayload,
  type CreateUserService,
} from './create-user.service';
import { makeCreateUserService, makeGetUserService } from './factories';
import { UserAdapter } from './user.adapter';
import { type GetUserService } from './get-user.service';

export class UsersController {
  readonly #getUserService: GetUserService;

  readonly #createUserService: CreateUserService;

  constructor() {
    this.#getUserService = makeGetUserService();
    this.#createUserService = makeCreateUserService();

    autoBind(this);
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.#getUserService.execute({
      id: request.user.sub,
    });

    return pipe(
      result,
      E.match(
        (error) =>
          exhaustive.tag(error, 'tag', {
            ResourceNotFound: ({ resourceId }) =>
              reply.status(404).send({
                message: `User (${resourceId}) not found`,
              }),
          }),
        (success) =>
          reply.status(200).send({
            user: pipe(success.user, UserAdapter.toJSON),
          }),
      ),
    );
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const payload = pipe(request.body, createUserPayload.parse);

    const result = await this.#createUserService.execute(payload);

    return pipe(
      result,
      E.match(
        (error) =>
          exhaustive.tag(error, 'tag', {
            EmailNotAvailable: ({ email }) =>
              reply.status(409).send({
                message: `The email "${email}" is already registered`,
              }),
          }),
        ({ user }) =>
          reply.status(201).send({
            user: pipe(user, UserAdapter.toJSON),
          }),
      ),
    );
  }
}
