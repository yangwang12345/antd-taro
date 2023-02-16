import dayjs from 'dayjs'
import {useMemo} from 'react'
import range from 'lodash/range'
import precisionToLength from './precision-to-length'

export const renderLabel = (type, data) => {
  if (type === 'year') {
    return `${data}年`
  }
  if (type === 'month') {
    return `${data}月`
  }
  if (type === 'day') {
    return `${data}日`
  }
  if (type === 'hour') {
    return `${data.toString().padStart(2, '0')}时`
  }
  if (type === 'minute') {
    return `${data.toString().padStart(2, '0')}分`
  }
  return data;
};

export const valueToDate = (value) => {
  if (value[0] === -1) {
    return 'sofar';
  }
  let output = dayjs(new Date(0));
  ['year', 'month', 'date', 'hour', 'minute'].forEach((key, index) => {
    if (value[index] !== void (0)) {
      if (key === 'date' && value[index] > getMonthDayCount(output.year(), output.month())) {
        return getMonthDayCount(output.year(), output.month());
      }
      output = output[key](value[index]);
    } else {
      return;
    }
  });
  return output.toDate();
};

export const dateToValue = (value, precision) => {
  if (value === 'sofar') {
    return [-1];
  }
  const date = dayjs(value);
  const length = precisionToLength(precision);
  return [date.year(), date.month(), date.date(), date.hour(), date.minute()].slice(0, length);
};

export const getMonthDayCount = (year, month) => {
  if ([0, 2, 4, 6, 7, 9, 11].indexOf(month) >= 0) {
    return 31;
  }
  if (month === 1 && year % 4 === 0) {
    return 29;
  }
  if (month === 1 && year % 4 !== 0) {
    return 28;
  }
  return 30;
};

const useDateRange = ({max, min, value, renderLabel, soFar, precision}) => {
  const currentDate = dayjs(value), currentYear = currentDate.year(), currentMonth = currentDate.month(),
    currentDay = currentDate.date(), currentHour = currentDate.hour();
  const minDate = dayjs(min), minYear = minDate.year(), minMonth = minDate.month(), minDay = minDate.date(),
    minHour = minDate.hour(), minMinute = minDate.minute();
  const maxDate = dayjs(max), maxYear = maxDate.year(), maxMonth = maxDate.month(), maxDay = maxDate.date(),
    maxHour = maxDate.hour(), maxMinute = maxDate.minute();
  const yearList = useMemo(() => {
    const list = range(minYear, maxYear + 1).map((value) => {
      return {
        value, label: renderLabel('year', value)
      };
    });
    soFar && list.push({
      value: -1, label: '至今'
    });
    return list;
  }, [minYear, maxYear, renderLabel, soFar]);
  const minRangeMonth = minYear === currentYear ? minMonth : 0,
    maxRangeMonth = maxYear === currentYear ? maxMonth + 1 : 12;
  const monthList = useMemo(() => {
    return range(minRangeMonth, maxRangeMonth).map((value) => {
      return {
        value: value, label: renderLabel('month', value + 1)
      };
    });
  }, [minRangeMonth, maxRangeMonth, renderLabel]);

  const minRangeDay = minYear === currentYear && minMonth === currentMonth ? minDay : 1;
  const maxRangeDay = maxYear === currentYear && maxMonth === currentMonth ? maxDay + 1 : (getMonthDayCount(currentYear, currentMonth) + 1);
  const dayList = useMemo(() => {
    return range(minRangeDay, maxRangeDay).map((value) => {
      return {
        value, label: renderLabel('day', value)
      };
    });
  }, [minRangeDay, maxRangeDay, renderLabel]);
  const minRangeHour = minYear === currentYear && minMonth === currentMonth && minDay === currentDay ? minHour : 0;
  const maxRangeHour = maxYear === currentYear && maxMonth === currentMonth && maxDay === currentDay ? maxHour + 1 : 24
  const hourList = useMemo(() => {
    return range(minRangeHour, maxRangeHour).map((value) => {
      return {
        value: value, label: renderLabel('hour', value)
      };
    });
  }, [minRangeHour, maxRangeHour, renderLabel]);

  const minRangeMinute = minYear === currentYear && minMonth === currentMonth && minDay === currentDay && minHour === currentHour ? minMinute : 0;
  const maxRangeMinute = maxYear === currentYear && maxMonth === currentMonth && maxDay === currentDay && maxHour === currentHour ? maxMinute + 1 : 60;
  const minuteList = useMemo(() => {
    return range(minRangeMinute, maxRangeMinute).map((value) => {
      return {
        value: value, label: renderLabel('minute', value)
      };
    });
  }, [minRangeMinute, maxRangeMinute, renderLabel]);
  const length = precisionToLength(precision);
  return value === 'sofar' ? [yearList, [], [], [], []].slice(0, length) : [yearList, monthList, dayList, hourList, minuteList].slice(0, length);
};

export default useDateRange;
