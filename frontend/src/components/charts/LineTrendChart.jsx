'use client';
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';
// Initialize Highcharts modules safely
if (typeof Highcharts === 'object' && typeof HighchartsMore === 'function' && typeof window !== 'undefined') {
    HighchartsMore(Highcharts);
}
const LineTrendChart = ({ options }) => {
    return (<HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { height: '100%', width: '100%' } }}/>);
};
export default LineTrendChart;
