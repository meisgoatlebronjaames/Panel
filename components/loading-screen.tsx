"use client"

import { useState, useEffect, useCallback, useRef } from "react"

const animalFacts = [
  "A group of flamingos is called a 'flamboyance'.",
  "Octopuses have three hearts and blue blood.",
  "Cows have best friends and get stressed when separated.",
  "A snail can sleep for three years.",
  "Elephants are the only animals that can't jump.",
  "A shrimp's heart is located in its head.",
  "Slugs have four noses.",
  "Koalas sleep up to 22 hours a day.",
  "A crocodile cannot stick its tongue out.",
  "Butterflies taste with their feet.",
  "Dolphins sleep with one eye open.",
  "Rats laugh when tickled.",
  "Penguins propose to their mates with a pebble.",
  "A group of owls is called a 'parliament'.",
  "Cats spend 70% of their lives sleeping.",
  "Honey never spoils - archaeologists found 3000-year-old edible honey.",
  "A blue whale's heart is the size of a small car.",
  "Wombat poop is cube-shaped.",
  "Starfish don't have brains.",
  "A giraffe's tongue is about 21 inches long.",
  "Humans share 60% of their DNA with bananas.",
  "Your nose can remember 50,000 different scents.",
  "Babies are born with 300 bones but adults only have 206.",
  "The human brain uses 20% of the body's total energy.",
  "Crows can recognize human faces and hold grudges.",
]

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentFact, setCurrentFact] = useState("")
  const [factOpacity, setFactOpacity] = useState(1)
  const startTime = useRef(Date.now())

  const getRandomFact = useCallback(() => {
    return animalFacts[Math.floor(Math.random() * animalFacts.length)]
  }, [])

  useEffect(() => {
    setCurrentFact(getRandomFact())

    const factInterval = setInterval(() => {
      setFactOpacity(0)
      setTimeout(() => {
        setCurrentFact(getRandomFact())
        setFactOpacity(1)
      }, 150)
    }, 800)

    const duration = 1000

    let animationFrame: number

    const animate = () => {
      const elapsed = Date.now() - startTime.current
      const newProgress = Math.min((elapsed / duration) * 100, 100)

      setProgress(newProgress)

      if (newProgress >= 100) {
        clearInterval(factInterval)
        setTimeout(() => {
          onComplete()
        }, 100)
      } else {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
      clearInterval(factInterval)
    }
  }, [onComplete, getRandomFact])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f] p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Fact text with fade animation */}
        <p
          className="text-center text-muted-foreground text-sm min-h-[3rem]"
          style={{
            opacity: factOpacity,
            transition: "opacity 0.15s ease-in-out",
          }}
        >
          {currentFact}
        </p>

        {/* Progress bar container */}
        <div className="space-y-2">
          <div className="h-1.5 w-full rounded-full bg-[#1a1a24] overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{
                width: `${progress}%`,
                transition: "width 0.05s linear",
              }}
            />
          </div>

          {/* Progress percentage */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Loading resources</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
