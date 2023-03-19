import { type FastifyReply, type FastifyRequest } from 'fastify';

import autoBind from 'auto-bind';

import { A, pipe } from '@shared/effect';

import { createGymPayload, type CreateGymService } from './create-gym.service';
import {
  makeCreateGymService,
  makeGetNearbyGymsService,
  makeSearchGymsService,
} from './factories';
import { GymAdapter } from './gym.adapter';
import {
  searchGymsPayload,
  type SearchGymsService,
} from './search-gyms.service';
import {
  getNearbyGymsPayload,
  type GetNearbyGymsService,
} from './get-nearby-gyms.service';

export class GymsController {
  readonly #createGymService: CreateGymService;

  readonly #getNearbyGymsService: GetNearbyGymsService;

  readonly #searchGymsService: SearchGymsService;

  constructor() {
    this.#createGymService = makeCreateGymService();
    this.#getNearbyGymsService = makeGetNearbyGymsService();
    this.#searchGymsService = makeSearchGymsService();

    autoBind(this);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const payload = pipe(request.body, createGymPayload.parse);

    const gym = await this.#createGymService.execute(payload);

    return reply.status(201).send({
      gym: pipe(gym, GymAdapter.toJSON),
    });
  }

  async getNearby(request: FastifyRequest, reply: FastifyReply) {
    const payload = pipe(request.query, getNearbyGymsPayload.parse);

    const { items, metadata } = await this.#getNearbyGymsService.execute(
      payload,
    );

    return reply.status(200).send({
      items: pipe(items, A.map(GymAdapter.toJSON)),
      metadata,
    });
  }

  async search(request: FastifyRequest, reply: FastifyReply) {
    const payload = pipe(request.query, searchGymsPayload.parse);

    const { items, metadata } = await this.#searchGymsService.execute(payload);

    return reply.status(200).send({
      items: pipe(items, A.map(GymAdapter.toJSON)),
      metadata,
    });
  }
}
