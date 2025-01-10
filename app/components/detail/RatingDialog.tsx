import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Star } from 'lucide-react'
import { useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

interface RatingDialogProps {
  isOpen: boolean,
  close: () => void,
  setTempRating: (rating: number) => void,
  rating: number
  setRating: () => void,
}

export function RatingDialog({ isOpen, close, setTempRating, rating, setRating }: RatingDialogProps) {
  const onValueChange = useCallback((value: Array<number>) => {
    if (value[0]) setTempRating(value[0])
  }, [setTempRating])
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) close()
    }}>
      <DialogContent className="text-white bg-zinc-900">
        <DialogHeader>
          <DialogTitle>Rate this title</DialogTitle>
          <DialogDescription>Drag the slider to set your rating</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center my-6 space-y-4">
          <div className="flex justify-center">
           <Stars rating={rating} />
          </div>
          <Slider
            value={[rating]}
            onValueChange={onValueChange}
            max={10}
            step={0.1}
            className="w-full max-w-md"
          />
          <span className="text-2xl font-bold">{rating.toFixed(1)}</span>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" className="mr-2 text-black" onClick={close}>
            Cancel
          </Button>
          <Button onClick={setRating}>
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Stars({ rating }: {
  rating: number
}) {
  const stars = []
  const fullStars = Math.floor(rating)
  const decimalPart = rating % 1

  for (let i = 1; i <= 10; i++) {
    if (i <= fullStars) {
      stars.push(<Star key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" />)
    } else if (i === fullStars + 1 && decimalPart > 0) {
      stars.push(
        <div key={i} className="relative w-6 h-6">
          <Star className="w-6 h-6 text-gray-400" />
          <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${decimalPart * 100}%` }}>
            <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
          </div>
        </div>
      )
    } else {
      stars.push(<Star key={i} className="w-6 h-6 text-gray-400" />)
    }
  }
  return stars
}