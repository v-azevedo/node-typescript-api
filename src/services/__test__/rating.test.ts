import { Beach, GeoPosition } from '@src/models/beach';
import { Rating } from '../rating';
import { ForecastPoint } from '@src/clients/stormGlass';

describe('Rating Service', () => {
  const defaultBeach: Beach = {
    lat: -33.792726,
    lng: 151.289824,
    name: 'Manly',
    position: GeoPosition.E,
    user: 'any-id',
  };
  const defaultRating = new Rating(defaultBeach);

  describe('Calculate rating for a given point', () => {
    const defaulPoint: ForecastPoint = {
      swellDirection: 110,
      swellHeight: 0.1,
      swellPeriod: 5,
      time: 'test',
      waveDirection: 110,
      windDirection: 100,
      windSpeed: 100,
      waveHeight: 0.1,
    };

    it('should get a rating less than 1 for a poor point', () => {
      const rating = defaultRating.getRatingForPoint(defaulPoint);

      expect(rating).toBe(1);
    });

    it('should get a rating of 1 for an ok point', () => {
      const pointData = {
        swellHeight: 0.4,
      };
      const point = { ...defaulPoint, ...pointData };
      const rating = defaultRating.getRatingForPoint(point);

      expect(rating).toBe(1);
    });

    it('should get a rating of 3 for a point with offshore winds and a half overhead height', () => {
      const point = {
        ...defaulPoint,
        ...{ swellHeight: 0.7, windDirection: 250 },
      };
      const rating = defaultRating.getRatingForPoint(point);

      expect(rating).toBe(3);
    });

    it('should get a rating of 4 for a point with offshore winds, half overhead height swell and good interval', () => {
      const point = {
        ...defaulPoint,
        ...{ swellHeight: 0.7, swellPeriod: 12, windDirection: 250 },
      };
      const rating = defaultRating.getRatingForPoint(point);

      expect(rating).toBe(4);
    });

    it('should get a rating of 4 for a point with offshore winds, shoulder high swell and good interval', () => {
      const point = {
        ...defaulPoint,
        ...{ swellHeight: 1.5, swellPeriod: 12, windDirection: 250 },
      };
      const rating = defaultRating.getRatingForPoint(point);

      expect(rating).toBe(4);
    });

    it('should get a rating of 5 classic day!', () => {
      const point = {
        ...defaulPoint,
        ...{ swellHeight: 2.5, swellPeriod: 16, windDirection: 250 },
      };
      const rating = defaultRating.getRatingForPoint(point);

      expect(rating).toBe(5);
    });

    it('should get a rating of 4 a good condition but with crossshore winds', () => {
      const point = {
        ...defaulPoint,
        ...{ swellHeight: 2.5, swellPeriod: 16, windDirection: 130 },
      };
      const rating = defaultRating.getRatingForPoint(point);

      expect(rating).toBe(4);
    });
  });

  describe('Get rating based on wind and wave positions', () => {
    it('should get rating 1 for a beach with onshore winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        GeoPosition.E,
        GeoPosition.E
      );

      expect(rating).toBe(1);
    });

    it('should get rating 1 for a beach with cross winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        GeoPosition.E,
        GeoPosition.S
      );

      expect(rating).toBe(3);
    });

    it('should get rating 1 for a beach with offshore winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        GeoPosition.E,
        GeoPosition.W
      );

      expect(rating).toBe(5);
    });
  });

  describe('Get rating based on swell period', () => {
    it('should get a rating of 1 for a period of 5 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(5);

      expect(rating).toBe(1);
    });

    it('should get a rating of 2 for a period of 9 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(9);

      expect(rating).toBe(2);
    });

    it('should get a rating of 4 for a period of 12 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(12);

      expect(rating).toBe(4);
    });

    it('should get a rating of 5 for a period of 16 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(16);

      expect(rating).toBe(5);
    });
  });

  describe('Get rating based on swell height', () => {
    it('should get rating 1 for less than ankle to knee high swell', () => {
      const rating = defaultRating.getRatingForSwellSize(0.2);

      expect(rating).toBe(1);
    });

    it('should get rating 2 for a ankle to knee swell', () => {
      const rating = defaultRating.getRatingForSwellSize(0.6);

      expect(rating).toBe(2);
    });

    it('should get rating 3 for waist high swell', () => {
      const rating = defaultRating.getRatingForSwellSize(1.5);

      expect(rating).toBe(3);
    });

    it('should get rating 5 for overhead swell', () => {
      const rating = defaultRating.getRatingForSwellSize(2.5);

      expect(rating).toBe(5);
    });
  });

  describe('Get position based on points location', () => {
    it('should get the point based on a east location', () => {
      const response = defaultRating.getPositionFromLocation(92);

      expect(response).toBe(GeoPosition.E);
    });

    it('should get the point based on a north location 1', () => {
      const response = defaultRating.getPositionFromLocation(360);

      expect(response).toBe(GeoPosition.N);
    });

    it('should get the point based on a north location 2', () => {
      const response = defaultRating.getPositionFromLocation(40);

      expect(response).toBe(GeoPosition.N);
    });

    it('should get the point based on a south location', () => {
      const response = defaultRating.getPositionFromLocation(200);

      expect(response).toBe(GeoPosition.S);
    });

    it('should get the point based on a west location', () => {
      const response = defaultRating.getPositionFromLocation(300);

      expect(response).toBe(GeoPosition.W);
    });
  });
});
