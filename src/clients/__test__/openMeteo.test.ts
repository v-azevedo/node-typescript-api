import { OpenMeteo } from '../openMeteo';
import openMeteoWeather3HoursFixture from '@test/fixtures/openMeteo_weather_3_hours.json';
import openMeteoNormalized3HoursFixture from '@test/fixtures/openMeteo_normalized_response_3_hours.json';
import * as HTTPUtil from '@src/util/request';

jest.mock('@src/util/request');

describe('Open-Meteo client', () => {
  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
    typeof HTTPUtil.Request
  >;

  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;

  it('should return the normalized forecast from the Open-Meteo service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockResolvedValue({
      data: openMeteoWeather3HoursFixture,
    } as HTTPUtil.Response);

    const openMeteo = new OpenMeteo(mockedRequest);
    const response = await openMeteo.fetchPoints(lat, lng);

    expect(response).toEqual(openMeteoNormalized3HoursFixture);
  });

  it('should get a generic error from OpenMeteo service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockRejectedValue('Network Error');

    const openMeteo = new OpenMeteo(mockedRequest);

    await expect(openMeteo.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to OpenMeteo: "Network Error"'
    );
  });

  it('should get an OpenMeteoResponseError when the OpenMeteo service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    class FakeAxiosError extends Error {
      constructor(public response: object) {
        super();
      }
    }

    mockedRequest.get.mockRejectedValue(
      new FakeAxiosError({
        status: 429,
        data: {
          error: true,
          reason:
            'Cannot initialize TemperatureUnit from invalid String value metric for key temperature_unit',
        },
      })
    );

    MockedRequestClass.isRequestError.mockReturnValue(true);
    MockedRequestClass.extractErrorData.mockReturnValue({
      status: 429,
      data: {
        error: true,
        reason:
          'Cannot initialize TemperatureUnit from invalid String value metric for key temperature_unit',
      },
    });

    const openMeteo = new OpenMeteo(mockedRequest);

    await expect(openMeteo.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the OpenMeteo service: Error: {"error":true,"reason":"Cannot initialize TemperatureUnit from invalid String value metric for key temperature_unit"} Code: 429'
    );
  });
});
