import { z } from 'zod'
import { GameSchema, GameDetailSchema, GameResponseSchema } from '@/schemas/game.schema'

// Eksport Type
export type GameProps = z.infer<typeof GameSchema>;
export type GameDetailProps = z.infer<typeof GameDetailSchema>;
export type GameResponseProps = z.infer<typeof GameResponseSchema>