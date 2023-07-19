import { OpenMeteo } from '@src/clients/openMeteo';
import openMeteoNormalizedResponseFixture from '@test/fixtures/openMeteo_normalized_response_3_hours.json';
import { Forecast, ForecastProcessingInternalError } from '../forecast';
import { Beach, GeoPosition } from '@src/models/beach';

jest.mock('@src/clients/openMeteo');

describe('Forecast Service', () => {
  const mockedOpenMeteoService = new OpenMeteo() as jest.Mocked<OpenMeteo>;

  it('should return the forecast for multiple beaches in the same hour with different ratings ordered by rating', async () => {
    mockedOpenMeteoService.fetchPoints.mockResolvedValueOnce([
      {
        swellDirection: 123.41,
        swellHeight: 0.21,
        swellPeriod: 3.67,
        time: '2020-04-26T00:00:00+00:00',
        waveDirection: 232.12,
        waveHeight: 0.46,
        windDirection: 310.48,
      },
    ]);
    mockedOpenMeteoService.fetchPoints.mockResolvedValueOnce([
      {
        swellDirection: 64.26,
        swellHeight: 0.15,
        swellPeriod: 13.89,
        time: '2020-04-26T00:00:00+00:00',
        waveDirection: 231.38,
        waveHeight: 2.07,
        windDirection: 299.45,
      },
    ]);

    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
        user: 'any-id',
      },
      {
        lat: -33.792726,
        lng: 141.289824,
        name: 'Dee Why',
        position: GeoPosition.S,
        user: 'any-id',
      },
    ];
    const expectedResponse = [
      {
        time: '2020-04-26T00:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 141.289824,
            name: 'Dee Why',
            position: 'S',
            rating: 3,
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 13.89,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 231.38,
            waveHeight: 2.07,
            windDirection: 299.45,
          },
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 2,
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
          },
        ],
      },
    ];
    const forecast = new Forecast(mockedOpenMeteoService);
    const beachesWithRating = await forecast.processForecastForBeaches(beaches);
    expect(beachesWithRating).toEqual(expectedResponse);
  });

  it('should return the forecast for a list of beaches', async () => {
    mockedOpenMeteoService.fetchPoints.mockResolvedValue(
      openMeteoNormalizedResponseFixture
    );

    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
        user: 'any-id',
      },
    ];

    const expectedResponse = [
      {
        time: '2023-07-19T00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 3,
            swellDirection: 184,
            swellHeight: 1.14,
            swellPeriod: 8.7,
            time: '2023-07-19T00:00',
            waveDirection: 184,
            waveHeight: 1.14,
            windDirection: 237,
          },
        ],
      },
      {
        time: '2023-07-19T01:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 3,
            swellDirection: 183,
            swellHeight: 1.24,
            swellPeriod: 9.0,
            time: '2023-07-19T01:00',
            waveDirection: 183,
            waveHeight: 1.24,
            windDirection: 222,
          },
        ],
      },
      {
        time: '2023-07-19T02:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 2,
            swellDirection: 183,
            swellHeight: 1.32,
            swellPeriod: 9.15,
            time: '2023-07-19T02:00',
            waveDirection: 183,
            waveHeight: 1.32,
            windDirection: 207,
          },
        ],
      },
    ];

    const forecast = new Forecast(mockedOpenMeteoService);
    const beachesWithRating = await forecast.processForecastForBeaches(beaches);

    expect(beachesWithRating).toEqual(expectedResponse);
  });

  it('should return an empty list when the beaches array is empty', async () => {
    const forecast = new Forecast();
    const response = await forecast.processForecastForBeaches([]);

    expect(response).toEqual([]);
  });

  it('should throw internal processing error when something goes wrong during the rating process', async () => {
    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
        user: 'any-id',
      },
    ];

    mockedOpenMeteoService.fetchPoints.mockRejectedValue('Error fetching data');

    const forecast = new Forecast(mockedOpenMeteoService);
    await expect(forecast.processForecastForBeaches(beaches)).rejects.toThrow(
      ForecastProcessingInternalError
    );
  });
});
