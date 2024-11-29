import { Card } from '@/components/ui/card';
import { AreaGraph } from './area-graph';
import { motion } from 'framer-motion';

interface ReviewsChartProps {
  reviews: any[]; // Replace with proper type
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function ReviewsChart({ reviews }: ReviewsChartProps) {
  return (
    <motion.div variants={item} className="col-span-4">
      <Card className="h-full">
        <AreaGraph reviews={reviews} />
      </Card>
    </motion.div>
  );
}
