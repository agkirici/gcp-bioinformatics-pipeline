import DatePicker from 'react-datepicker'
import { Calendar, X } from 'lucide-react'
import 'react-datepicker/dist/react-datepicker.css'

interface DateRangeFilterProps {
  startDate: Date | null
  endDate: Date | null
  onChange: (start: Date | null, end: Date | null) => void
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onChange,
}: DateRangeFilterProps) {
  const handleClear = () => {
    onChange(null, null)
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Date:
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">From:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => onChange(date, endDate)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate || new Date()}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              dateFormat="MMM dd, yyyy"
              placeholderText="Start date"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">To:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => onChange(startDate, date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              dateFormat="MMM dd, yyyy"
              placeholderText="End date"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={handleClear}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

