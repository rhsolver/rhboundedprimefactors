// Helper functions
function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
}

function modZeroTestWithBounds1(composite, lowerBound = null, upperBound = null, recursionDepth = 0, maxDepth = 5000) {
    if (recursionDepth > maxDepth) {
        console.warn("Maximum recursion depth reached. Switching to deep search.");
        return modZeroTestWithBounds2(composite, lowerBound, upperBound, 0);
    }

    if (lowerBound === null) lowerBound = Math.max(2, Math.floor(Math.sqrt(composite / 2)));
    if (upperBound === null) upperBound = 2 * lowerBound;

    if (lowerBound < 2) lowerBound = 2;

    if (lowerBound <= 2) {
        console.info("Reached minimum bound of 2. Potential prime.");
        return modZeroTestWithBounds2(composite, null, null, 0);
    }

    let factor1 = null;
    let steps = Math.max(2, Math.ceil((lowerBound + upperBound) / Math.log2(lowerBound)));

    steps += steps % 2 === 0 ? 1 : 0; // Ensure steps are odd

    console.info(`Testing bounds: lowerBound=${lowerBound}, upperBound=${upperBound}`);
    while (steps >= 2) {
        for (let i = lowerBound; i <= upperBound; i += steps) {
            for (let offset = -steps; offset <= steps; offset += 2) {
                let divisor = i + offset;
                if (divisor > 1 && composite % divisor === 0) {
                    factor1 = divisor;
                    console.info(`Found factor: ${factor1}`);
                    break;
                }
            }
            if (factor1) break;
        }
        if (factor1) break;

        steps = Math.floor(Math.sqrt(Math.abs(steps)));
        if (steps % 2 === 0) steps -= 1;
    }

    if (factor1 && isPrime(factor1)) {
        return factor1;
    }

    const newLowerBound = Math.max(2, Math.floor(Math.sqrt(lowerBound / 2)));
    const newUpperBound = Math.max(2, lowerBound);
    return modZeroTestWithBounds1(composite, newLowerBound, newUpperBound, recursionDepth + 1);
}

function findPrimeFactorsWithSuccessRateSingleRun(n) {
    if (n < 2) {
        console.warn(`Input ${n} is less than 2, no prime factors.`);
        return { factors: [], successRate: 0 };
    }

    let primeFactors = [];
    let originalN = n;

    [2, 3, 5, 7].forEach(smallPrime => {
        while (n % smallPrime === 0) {
            primeFactors.push(smallPrime);
            n = Math.floor(n / smallPrime);
        }
    });

    while (n > 1) {
        let factor = modZeroTestWithBounds1(n);
        if (!factor || factor < 2) {
            if (isPrime(n)) {
                primeFactors.push(n);
                break;
            } else {
                console.error(`Invalid factor ${factor}. Cannot continue decomposition.`);
                break;
            }
        }

        while (n % factor === 0) {
            primeFactors.push(factor);
            n = Math.floor(n / factor);
        }
    }

    const reconstructedN = primeFactors.reduce((acc, curr) => acc * curr, 1);
    const successRate = reconstructedN === originalN && primeFactors.every(factor => isPrime(factor)) ? 100 : 0;

    return { factors: primeFactors, successRate: successRate };
}

// Test function (example usage)
function testPrimeFactors() {
    const num = parseInt(document.getElementById("numberInput").value);
    const result = findPrimeFactorsWithSuccessRateSingleRun(num);
    document.getElementById("result").innerText = 
        `Prime Factors: ${result.factors.join(", ")} | Success Rate: ${result.successRate}%`;
}
