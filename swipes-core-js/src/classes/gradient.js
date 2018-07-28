const fullDaySeconds = 86400;
const gradientSegmentPercentage = 100 / 12;

const gradientColors = [
  '#1D2069',
  '#486FBC',
  '#FFA68F',
  '#F67F7F',
  '#74C7F5',
  '#4973C9',
  '#D07CA7',
  '#F4945F',
  '#F5919E',
  '#B46F89',
  '#1D2069',
];

const Gradient = {
  daySegments: [
    {
      time: 37.5, // 00:00 - 09:00
      width: gradientSegmentPercentage / 2,
    },
    {
      time: 4.166666, // 09:00 - 10:00
      width: (gradientSegmentPercentage * 3) + (gradientSegmentPercentage / 2),
    },
    {
      time: 33.333333, // 10:00 - 18:00
      width: (gradientSegmentPercentage * 2) - (gradientSegmentPercentage / 2),
    },
    {
      time: 6.25, // 18:00 - 19:30
      width: (gradientSegmentPercentage * 4) + (gradientSegmentPercentage / 2),
    },
    {
      time: 18.75, // 19:30 - 00:00
      width: gradientSegmentPercentage * 2,
    },
  ],
  getGradientPos(percent) {
    let newPercent = percent;

    if (!newPercent) {
      newPercent = this.percentOfCurrentDay();
    }

    const daySegments = this.daySegments;
    const segLen = daySegments.length;
    let segTimeSum = 0;
    let currentWidth = 0;

    for (let i = 0; i < segLen; i += 1) {
      const seg = daySegments[i];

      segTimeSum += seg.time;

      if (newPercent >= segTimeSum) {
        currentWidth += seg.width;
      } else {
        const prevSegSum = segTimeSum - seg.time;
        const portionOfDay = newPercent - prevSegSum;
        const percentOfSeg = (portionOfDay / seg.time) * 100;
        const width = (seg.width * percentOfSeg) / 100;

        currentWidth += width;

        break;
      }
    }

    let currentGradientPosition = (100 * currentWidth) / 100;

    currentGradientPosition = Math.round(currentGradientPosition * 1e2) / 1e2;

    return currentGradientPosition;
  },
  getGradientStyles() {
    return {
      backgroundImage: `linear-gradient(to right, ${gradientColors.join(', ')})`,
      backgroundSize: '1100% 1100%',
    };
  },
  percentOfValue(elapsed, total) {
    let newElapsed = elapsed;

    if (newElapsed > total) {
      newElapsed %= total;
    }
    return (newElapsed / total) * 100;
  },
  percentOfCurrentDay() {
    const today = new Date();
    const hoursSeconds = today.getHours() * 60 * 60;
    const minutesSeconds = today.getMinutes() * 60;
    const seconds = today.getSeconds();
    const currentTimeSeconds = hoursSeconds + minutesSeconds + seconds;
    const percentOfCurrentDay = (currentTimeSeconds / fullDaySeconds) * 100;

    return percentOfCurrentDay;
  },
};
export default Gradient;
