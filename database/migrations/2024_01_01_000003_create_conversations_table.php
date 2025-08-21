<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable()->comment('Group name or null for private chat');
            $table->enum('type', ['private', 'group'])->default('private');
            $table->string('image')->nullable()->comment('Group image or null');
            $table->text('description')->nullable()->comment('Group description');
            $table->timestamps();
            
            $table->index(['type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};