import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/ws' })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');
  private userSockets = new Map<string, string[]>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove socket from all user mappings
    for (const [userId, sockets] of this.userSockets) {
      const idx = sockets.indexOf(client.id);
      if (idx > -1) {
        sockets.splice(idx, 1);
        if (sockets.length === 0) this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string) {
    const existing = this.userSockets.get(userId) || [];
    existing.push(client.id);
    this.userSockets.set(userId, existing);
    client.join(`user:${userId}`);
    this.logger.log(`User ${userId} joined with socket ${client.id}`);
  }

  @SubscribeMessage('joinEstate')
  handleJoinEstate(client: Socket, estateId: string) {
    client.join(`estate:${estateId}`);
  }

  // Called from NotificationsService to push real-time updates
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToEstate(estateId: string, event: string, data: any) {
    this.server.to(`estate:${estateId}`).emit(event, data);
  }

  broadcastNotification(userId: string, notification: any) {
    this.sendToUser(userId, 'notification', notification);
  }
}
