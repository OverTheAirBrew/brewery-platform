import { EventsGateway } from '../events/events.gateway';

export const mockSendMessage = jest.fn();

const mockEventsGateway = {
  sendMessage: jest.fn().mockReturnValue(mockSendMessage),
};

export const mockEventsGatewayProvider = {
  provide: EventsGateway,
  useValue: mockEventsGateway,
};
