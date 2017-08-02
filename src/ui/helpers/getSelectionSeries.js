import _ from 'lodash';

export default function getSelectionSeries(tracks, selected) {
    const series = [];

    let prevSelected = false;
    let newRequired = true;

    tracks.forEach((track, i) => {
        const isSelected = _.includes(selected, track.id);

        if (isSelected) {
            if (newRequired) {
                series.push([]);
                newRequired = false;
            }

            series[series.length - 1].push(i + 1);
        }

        if (!isSelected && prevSelected) {
            newRequired = true;
        }

        prevSelected = isSelected;
    });

    console.log(series);
    return series;
}
