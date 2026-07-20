<?php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceRecorded implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Attendance $attendance, public string $kind)
    {
    }

    public function broadcastOn(): Channel
    {
        return new Channel('monitoring');
    }

    public function broadcastAs(): string
    {
        return 'attendance.recorded';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'attendance_id' => $this->attendance->id,
            'user_id' => $this->attendance->user_id,
            'kind' => $this->kind, // check_in | check_out
            'work_date' => $this->attendance->work_date->toDateString(),
            'status' => $this->attendance->status,
            'late_minutes' => $this->attendance->late_minutes,
        ];
    }
}
