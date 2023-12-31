declare module 'random-points-on-polygon' {
    import { Feature, FeatureCollection, Point, Polygon, MultiPolygon } from 'geojson';

    export default function randomPointsOnPolygon(
      number: number,
      polygon: Feature<Polygon | MultiPolygon>,
      properties?: Object,
      fc?: Boolean
    ): Feature<Point>[] | FeatureCollection<Point>;
}
