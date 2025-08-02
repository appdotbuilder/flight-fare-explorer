
import { InteractiveRouteMap } from './InteractiveRouteMap';
import type { PopularRoute } from '../../../server/src/schema';

interface PopularRoutesMapProps {
  routes: PopularRoute[];
}

export function PopularRoutesMap({ routes }: PopularRoutesMapProps) {
  return <InteractiveRouteMap routes={routes} />;
}
