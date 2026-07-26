<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmployeeStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public User $user)
    {
    }

    /**
     * Channel privat yang didengarkan dashboard manajer.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('monitoring');
    }

    public function broadcastAs(): string
    {
        return 'employee.status';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->user->id,
            'name' => $this->user->name,
            'division' => $this->user->division,
            'activity_status' => $this->user->activity_status,
            'last_seen_at' => optional($this->user->last_seen_at)->toIso8601String(),
        ];
    }
}
