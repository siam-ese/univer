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

import { Tools } from '@univerjs/core';
import type { ILabelStyle } from '../../../chart/style.types';
import type { EChartSeriesItem, EChartSpec } from '../echart-render-engine';

type PartialLabelStyle = Partial<Pick<ILabelStyle, 'visible' | 'color' | 'fontSize' | 'italic' | 'bold' | 'underline' | 'strikethrough'>>;
export function applyLabelStyle(spec: Record<string, any>, path: string, labelStyle: PartialLabelStyle): void {
    if (labelStyle.color) {
        Tools.set(spec, path ? `${path}.color` : 'color', labelStyle.color);
    }
    Tools.set(spec, path ? `${path}.show` : 'show', labelStyle.visible);
    Tools.set(spec, path ? `${path}.fontSize` : 'fontSize', labelStyle.fontSize);
    Tools.set(spec, path ? `${path}.fontStyle` : 'fontStyle', labelStyle.italic ? 'italic' : 'normal');
    Tools.set(spec, path ? `${path}.fontWeight` : 'fontWeight', labelStyle.bold ? 'bold' : 'normal');
    // Tools.set(spec, path ? `${path}.underline` : 'underline', Boolean(labelStyle.underline));
    // Tools.set(spec, path ? `${path}.lineThrough` : 'lineThrough', Boolean(labelStyle.strikethrough));
}

export function toArray<T = unknown>(value: T | T[]): T[] {
    if (value === undefined) return [];
    if (Array.isArray(value)) return value;
    return [value];
}

export function seriesForEach(series: EChartSpec['series'], func: (item: EChartSeriesItem, index: number) => void) {
    if (!series) {
        return;
    }
    toArray(series).forEach((item, index) => func(item as EChartSeriesItem, index));
}

export function toPercentage(value: number, fixed: number = 2): string {
    const bits = Number(`1e${fixed}`);
    return `${(value * bits | 0) / bits}%`;
}

