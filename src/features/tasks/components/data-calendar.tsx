import {
    format,
    getDay,
    parse,
    startOfWeek,
    addMonths,
    subMonths,

} from "date-fns"

import {
    Calendar,
    dateFnsLocalizer,
} from "react-big-calendar";

interface DataCalendarProps {
    data: any[];
}

export const DataCalendar = ({ data }: DataCalendarProps) => {
    return (
        <div>
            Data Calendar View
        </div>
    )
}