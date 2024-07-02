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

type DeepPartial<T, P extends keyof T = keyof T> = T extends object ? {
    [key in P]+?: DeepPartial<T[key]>;
} : T;

/* chart style */
export type ChartStyle = DeepPartial<IChartStyle>;

export interface ILabelStyle {
    content: string;
    fontSize: number;
    color: string;
    align: 'left' | 'right' | 'center';
    strikethrough: boolean;
    italic: boolean;
    underline: boolean;
}

export enum StackType {
    // None,
    Normal = '0',
    Percent = '1',
}

interface IChartStyle {
    common: {
        stackType: StackType;
        backgroundColor: string;
        fontSize: number;
        fontColor: string;
        borderColor: string;
        title: ILabelStyle;
        subtitle: ILabelStyle;
        xAxisTitle: ILabelStyle;
        yAxisTitle: ILabelStyle;
        dataPoints: {
            [index: number]: {};
        };
    };
    pie: {};
}
