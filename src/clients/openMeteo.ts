import { InternalError } from '@src/util/errors/internal-errors';
import config, { IConfig } from 'config';
import * as HTTPUtil from '@src/util/request';

export interface OpenMeteoPoint {
  readonly time: string[];
  readonly wave_height: number[];
  readonly wave_direction: number[];
  readonly swell_wave_direction: number[];
  readonly swell_wave_height: number[];
  readonly swell_wave_period: number[];
  readonly wind_wave_direction: number[];
}

export interface OpenMeteoForecastResponse {
  hourly: OpenMeteoPoint;
}

export interface ForecastPoint {
  time: string;
  waveHeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windDirection: number;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to OpenMeteo';
    super(`${internalMessage}: ${message}`);
  }
}

export class OpenMeteoResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the OpenMeteo service';
    super(`${internalMessage}: ${message}`);
  }
}

const openMeteoResourcesConfig: IConfig = config.get('App.resources.OpenMeteo');

export class OpenMeteo {
  constructor(protected request = new HTTPUtil.Request()) {}

  readonly openMeteoAPIParams =
    'wave_height,wave_direction,wind_wave_direction,swell_wave_height,swell_wave_direction,swell_wave_period';

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const response = await this.request.get<OpenMeteoForecastResponse>(
        `${openMeteoResourcesConfig.get(
          'apiUrl'
        )}/marine?latitude=${lat}&longitude=${lng}&hourly=${
          this.openMeteoAPIParams
        }`
      );

      return this.normalizeResponse(response.data);
    } catch (err) {
      if (err instanceof Error && HTTPUtil.Request.isRequestError(err)) {
        const error = HTTPUtil.Request.extractErrorData(err);
        throw new OpenMeteoResponseError(
          `Error: ${JSON.stringify(error.data)} Code: ${error.status}`
        );
      }
      throw new ClientRequestError(JSON.stringify(err));
    }
  }

  private normalizeResponse(
    points: OpenMeteoForecastResponse
  ): ForecastPoint[] {
    const {
      swell_wave_direction,
      swell_wave_height,
      swell_wave_period,
      wave_direction,
      wave_height,
      wind_wave_direction,
    } = points.hourly;

    return points.hourly.time.map((time, i) => ({
      time,
      swellDirection: swell_wave_direction[i],
      swellHeight: swell_wave_height[i],
      swellPeriod: swell_wave_period[i],
      waveDirection: wave_direction[i],
      waveHeight: wave_height[i],
      windDirection: wind_wave_direction[i],
    }));
  }
}
