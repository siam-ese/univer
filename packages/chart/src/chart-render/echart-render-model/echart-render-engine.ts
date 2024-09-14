/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as echarts from 'echarts';
import type { Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import type { RenderSpecOperator } from '../types';
import type { IChartInstance } from '../chart-instance';

export type OptionalDataValue = number | string | null | undefined;
export type ExtractArrayItem<T> = T extends Array<infer U> ? U : never;

export type EChartSpec = echarts.EChartsOption;
export type EChartSeriesItem = ExtractArrayItem<EChartSpec['series']> & { rawData?: number[]; seriesId: string };
export const EChartRenderEngineName = 'VChart';

export type EChartInstance = IChartInstance<EChartSpec>;

export type EChartRenderSpecOperator = RenderSpecOperator<EChartSpec>;
export class EChartRenderEngine extends Disposable implements EChartInstance {
    static override name = EChartRenderEngineName;
    private _instance: echarts.ECharts | null;
    public container: HTMLElement | string = '';

    constructor() {
        super();
    }

    mount(id: string | HTMLElement): void {
        this.container = id;
    }

    private _ensureChartInstance() {
        if (!this._instance) {
            this._instance = echarts.init(this.containerElement, null, {
                // useDirtyRect: true,
                // width: 468,
                // height: 369,
            });
        }
        return this._instance!;
    }

    get containerElement() {
        const { container } = this;
        return container instanceof HTMLElement ? container : document.getElementById(container);
    }

    render(spec: EChartSpec): void {
        const instance = this._ensureChartInstance();
        instance.setOption(spec, true);
    }

    setBorderColor(color: Nullable<string>): void {
        const dom = this.containerElement;

        if (dom) {
            dom.style.border = `1px solid ${color}`;
            this._ensureChartInstance().resize();
        }
    }

    // setTheme(name: string, options: IChartThemeOptions): void {
        // const instance = this._ensureChartInstance();

        // if (VChart.ThemeManager.themeExist(name)) {
        //     VChart.ThemeManager.removeTheme(name);
        // }

        // VChart.ThemeManager.registerTheme(name, {
        //     colorScheme: {
        //         default: options.colors,
        //     },
        // });

        // VChart.ThemeManager.setCurrentTheme(name);
    // }

    async exportImg() {
        const instance = this._ensureChartInstance();

        return instance.getDataURL({
            type: 'png',
        }); ;
    }

    onDispose(dispose: () => void): void {
        this.disposeWithMe(dispose);
    }
}
