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

import VChart from '@visactor/vchart';
import type { ISpec } from '@visactor/vchart';
import type { Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import type { RenderSpecOperator } from '../types';
import type { IChartInstance } from '../chart-instance';

export type VChartSpec = ISpec;
export const VChartRenderEngineName = 'VChart';

export type VChartRenderSpecOperator = RenderSpecOperator<VChartSpec>;
export class VChartRenderEngine extends Disposable implements IChartInstance<VChartSpec> {
    static override name = VChartRenderEngineName;
    private _vchart: VChart | null;
    public container: HTMLElement | string = '';

    constructor() {
        super();
    }

    mount(id: string | HTMLElement): void {
        this.container = id;
    }

    private _ensureChartInstance() {
        if (!this._vchart) {
            this._vchart = new VChart({
                type: '',
            }, {
                dom: this.container,
                animation: false,
            });
        }
        return this._vchart!;
    }

    get containerElement() {
        const { container } = this;
        return container instanceof HTMLElement ? container : document.getElementById(container);
    }

    render(spec: VChartSpec): void {
        const instance = this._ensureChartInstance();
        // instance.updateSpec(spec, false);

        instance.updateSpec(spec, false);
    }

    setBorderColor(color: Nullable<string>): void {
        const { containerElement } = this;
        if (containerElement) {
            containerElement.style.border = `3px solid ${color || 'transparent'}`;
        }
    }

    setTheme(): void {
    }

    exportImg() {
        return Promise.resolve('');
    }

    onDispose(dispose: () => void): void {
        this.disposeWithMe(dispose);
    }
}
