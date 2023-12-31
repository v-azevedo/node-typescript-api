import openMeteoWeather3HoursFixture from '@test/fixtures/openMeteo_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json';
import { Beach, GeoPosition } from '@src/models/beach';
import nock from 'nock';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beach forecast functional tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john2@mail.com',
    password: '1234',
  };
  let token: string;

  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});

    const user = await new User(defaultUser);

    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: GeoPosition.E,
      user: user.id,
    };

    await new Beach(defaultBeach).save();

    token = AuthService.generateToken(user.toJSON());
  });

  it('should return a forecast with just a few times', async () => {
    // Interceps the request and returns with the nock format for the response
    // nock.recorder.rec();
    nock('https://marine-api.open-meteo.com:443')
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v1/marine')
      .query({
        latitude: '-33.792726',
        longitude: '151.289824',
        hourly: /(.*)/,
      })
      .reply(200, openMeteoWeather3HoursFixture);
    const { body, status } = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });

    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  });

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://marine-api.open-meteo.com:443')
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v1/marine')
      .query({
        latitude: '-33.792726',
        longitude: '151.289824',
        hourly: /(.*)/,
      })
      .replyWithError('Something went wrong');

    const { status } = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });

    expect(status).toBe(500);
  });
});
