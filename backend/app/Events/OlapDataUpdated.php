<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast setelah ETL single-profile selesai.
 * Channel public 'olap' agar dashboard admin (tanpa auth WS) bisa listen.
 * Dengan BROADCAST_CONNECTION=log => hanya log (tidak butuh Reverb/Pusher).
 * Jika diganti ke reverb/pusher => push WS real-time instant.
 *
 * Frontend: Echo.channel('olap').listen('OlapDataUpdated', ()=>fetchOlap())
 */
class OlapDataUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $alumniProfileId,
        public int $tahunLulus,
        public int $timestamp = 0
    ) {
        $this->timestamp = $timestamp ?: time();
    }

    public function broadcastOn(): Channel
    {
        return new Channel('olap');
    }

    public function broadcastAs(): string
    {
        return 'OlapDataUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'alumni_profile_id' => $this->alumniProfileId,
            'tahun_lulus'       => $this->tahunLulus,
            'timestamp'         => $this->timestamp,
            'message'           => 'OLAP rekap diperbarui — dashboard sinkron',
        ];
    }
}
