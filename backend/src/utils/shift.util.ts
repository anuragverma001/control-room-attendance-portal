export const SHIFT_TIMINGS = {
    MORNING: {
      startHour: 6,
      startMinute: 0,
      endHour: 14,
      endMinute: 0,
    },
  
    EVENING: {
      startHour: 14,
      startMinute: 0,
      endHour: 22,
      endMinute: 0,
    },
  
    NIGHT: {
      startHour: 22,
      startMinute: 0,
      endHour: 6,
      endMinute: 0,
      isOvernight: true,
    
    },
  
    GENERAL: {
      startHour: 10,
      startMinute: 0,
      endHour: 18,
      endMinute: 0,
    },
  };
  
  export function getShiftTiming(
    shiftType: string
  ) {
    return (
      SHIFT_TIMINGS[
        shiftType as keyof typeof SHIFT_TIMINGS
      ]
    );
  }
  