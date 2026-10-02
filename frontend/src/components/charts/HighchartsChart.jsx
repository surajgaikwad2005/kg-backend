'use client';
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsTimeline from 'highcharts/modules/timeline';
if (typeof Highcharts === 'object' && typeof window !== 'undefined') {
    if (typeof HighchartsMore === 'function')
        HighchartsMore(Highcharts);
    if (typeof HighchartsTimeline === 'function')
        HighchartsTimeline(Highcharts);
}
const HighchartsChart = ({ options, containerProps, ...props }) => {
    return (<HighchartsReact highcharts={Highcharts} options={options} containerProps={containerProps || { style: { height: '100%', width: '100%' } }} {...props}/>);
};
export default HighchartsChart;
