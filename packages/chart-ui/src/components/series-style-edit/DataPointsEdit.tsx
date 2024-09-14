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

import React from 'react';

import type { DeepPartial, ISeriesStyle } from '@univerjs/chart';

import { ColorPickerControl } from '../color-picker-control';

export interface IDataPointsEditProps {
    dataPoints: DeepPartial<ISeriesStyle['dataPoints']>;
    onChange?: (key: string, dataPoints: DeepPartial<ISeriesStyle['dataPoints']>) => void;
}

export const DataPointsEdit = (props: IDataPointsEditProps) => {
    const { dataPoints, onChange } = props;
    const dataPointList = Object.keys(dataPoints).map((key) => {
        const dataPoint = dataPoints[Number(key)];

        return {
            key,
            style: dataPoint,
        };
    });

    return (
        <div>
            {dataPointList.map((dataPoint) => {
                const { style } = dataPoint;
                return (
                    <div key={dataPoint.key}>
                        <div className="chart-edit-panel-row">
                            <div className="chart-edit-panel-row-half">
                                <div className="chart-edit-panel-label">Data point</div>

                            </div>
                            <div className="chart-edit-panel-row-half">
                                <div className="chart-edit-panel-labe">Color</div>
                                <ColorPickerControl color={style?.color ?? ''} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
