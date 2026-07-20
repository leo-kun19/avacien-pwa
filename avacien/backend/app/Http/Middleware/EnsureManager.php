<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureManager
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isManager()) {
            return response()->json(['message' => 'Akses khusus manajer.'], 403);
        }

        return $next($request);
    }
}
