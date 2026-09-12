async function run() {
    const N = 10; // 10 pairs
    const DB_LATENCY = 50; // 50ms per query

    // Original implementation: Promise.all with N queries
    const start1 = performance.now();
    await Promise.all(
        Array.from({ length: N }).map(() => new Promise(resolve => setTimeout(resolve, DB_LATENCY)))
    );
    const end1 = performance.now();

    // Optimized implementation: 1 query
    const start2 = performance.now();
    await new Promise(resolve => setTimeout(resolve, DB_LATENCY));
    const end2 = performance.now();

    console.log(`Original: ${end1 - start1}ms`);
    console.log(`Optimized: ${end2 - start2}ms`);
    console.log(`Improvement: ${((end1 - start1) / (end2 - start2)).toFixed(2)}x faster, and uses ${N} fewer database connections.`);
}

run();
