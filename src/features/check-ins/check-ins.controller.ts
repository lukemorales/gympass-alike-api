import { type FastifyReply, type FastifyRequest } from 'fastify';

import { exhaustive } from 'exhaustive';
import { z } from 'zod';

import { A, E, pipe } from '@shared/effect';
import { GymId } from '@features/gyms';

import {
  createCheckInPayload,
  type CreateCheckInService,
} from './create-check-in.service';
import {
  listUserCheckInHistoryPayload,
  type ListUserCheckInHistoryService,
} from './list-user-check-in-history.service';
import {
  validateCheckInPayload,
  type ValidateCheckInService,
} from './validate-check-in.service';
import {
  makeCreateCheckInService,
  makeListUserCheckInHistoryService,
  makeValidateCheckInService,
} from './factories';
import { CheckInAdapter } from './check-in.adapter';

export class CheckInsController {
  private readonly createCheckInService: CreateCheckInService;

  private readonly listUserCheckInHistoryService: ListUserCheckInHistoryService;

  private readonly validateCheckInService: ValidateCheckInService;

  constructor() {
    this.createCheckInService = makeCreateCheckInService();
    this.listUserCheckInHistoryService = makeListUserCheckInHistoryService();
    this.validateCheckInService = makeValidateCheckInService();
  }

  async getHistory(request: FastifyRequest, reply: FastifyReply) {
    const { cursor } = pipe(
      request.query,
      listUserCheckInHistoryPayload.pick({ cursor: true }).parse,
    );

    const { items, metadata } =
      await this.listUserCheckInHistoryService.execute({
        userId: request.user.sub,
        cursor,
      });

    return reply.status(200).send({
      items: pipe(items, A.map(CheckInAdapter.toJSON)),
      metadata,
    });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const params = pipe(request.params, z.object({ gymId: GymId }).parse);

    const { coords } = pipe(
      request.body,
      createCheckInPayload.pick({ coords: true }).parse,
    );

    const result = await this.createCheckInService.execute({
      gymId: params.gymId,
      userId: request.user.sub,
      coords,
    });

    return pipe(
      result,
      E.match(
        (error) =>
          exhaustive.tag(error, 'tag', {
            ResourceNotFound: ({ resourceId }) =>
              reply.status(404).send({
                message: `The gym (${resourceId}) does not exist`,
              }),
            DuplicateCheckInNotAllowed: ({ gymId }) =>
              reply.status(409).send({
                message: `You have already checked-in today in this gym (${gymId})`,
              }),
            NotOnLocation: ({ distance }) =>
              reply.status(406).send({
                message: `You are too far away (${distance} km) from the gym to create a check-in`,
              }),
          }),
        ({ checkIn }) =>
          reply.status(201).send({
            checkIn: pipe(checkIn, CheckInAdapter.toJSON),
          }),
      ),
    );
  }

  async validate(request: FastifyRequest, reply: FastifyReply) {
    const payload = pipe(request.params, validateCheckInPayload.parse);

    const result = await this.validateCheckInService.execute(payload);

    return pipe(
      result,
      E.match(
        (error) =>
          exhaustive.tag(error, 'tag', {
            ResourceNotFound: ({ resourceId }) =>
              reply.status(404).send({
                message: `The check-in (${resourceId}) does not exist`,
              }),
            ExpiredCheckIn: ({ checkInId }) =>
              reply.status(406).send({
                message: `The check-in (${checkInId}) has already expired and cannot be validated`,
              }),
          }),
        ({ checkIn }) =>
          reply.status(200).send({
            checkIn: pipe(checkIn, CheckInAdapter.toJSON),
          }),
      ),
    );
  }
}
