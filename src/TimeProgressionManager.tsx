import { useState, useEffect, useRef } from 'react';

/**
 * Quản lý sự thay đổi giá trị của a (0->4) và b (0->17) theo thời gian từ 0-17 giây
 * Với chức năng chuyển tiếp và quay lại từng bước
 */

// Interface cho mỗi bản ghi dữ liệu
interface TimeBasedValue {
  a: number;
  b: number;
  timeSeconds: number;
  percent: number;
}

// Lớp quản lý thời gian và giá trị
class TimeProgressionManager {
  private currentTimeIndex: number = 0;
  private allTimeData: TimeBasedValue[] = [];
  private stepSize: number = 1; // Mặc định bước nhảy là 1 giây
  
  constructor(
    private aStart: number = 0,
    private aEnd: number = 4,
    private bStart: number = 0,
    private bEnd: number = 17,
    private totalDurationSeconds: number = 17,
    stepSizeSeconds: number = 1
  ) {
    this.stepSize = stepSizeSeconds;
    this.generateAllTimeData();
  }
  
  /**
   * Tạo dữ liệu cho tất cả các bước thời gian
   */
  private generateAllTimeData(): void {
    this.allTimeData = [];
    
    // Tạo dữ liệu cho mỗi bước thời gian
    for (let time = 0; time <= this.totalDurationSeconds; time += this.stepSize) {
      this.allTimeData.push(this.calculateValuesAtTime(time));
    }
    
    // Đảm bảo có điểm cuối cùng
    const lastTime = this.allTimeData[this.allTimeData.length - 1].timeSeconds;
    if (lastTime < this.totalDurationSeconds) {
      this.allTimeData.push(this.calculateValuesAtTime(this.totalDurationSeconds));
    }
  }
  
  /**
   * Tính toán giá trị a và b tại một thời điểm cụ thể
   */
  private calculateValuesAtTime(timeSeconds: number): TimeBasedValue {
    // Đảm bảo thời gian không vượt quá tổng thời gian
    const clampedTime = Math.min(Math.max(0, timeSeconds), this.totalDurationSeconds);
    
    // Tính phần trăm hoàn thành
    const percent = (clampedTime / this.totalDurationSeconds) * 100;
    
    // Tính toán giá trị a và b dựa trên thời gian
    const a = this.aStart + ((this.aEnd - this.aStart) * clampedTime / this.totalDurationSeconds);
    const b = this.bStart + ((this.bEnd - this.bStart) * clampedTime / this.totalDurationSeconds);
    
    // Làm tròn đến 2 chữ số thập phân để dễ đọc
    const roundedA = Math.round(a * 100) / 100;
    const roundedB = Math.round(b * 100) / 100;
    
    return {
      a: roundedA,
      b: roundedB,
      timeSeconds: clampedTime,
      percent: Math.round(percent * 100) / 100
    };
  }
  
  /**
   * Lấy giá trị hiện tại
   */
  public getCurrentValue(): TimeBasedValue {
    return this.allTimeData[this.currentTimeIndex];
  }
  
  /**
   * Chuyển tới bước tiếp theo
   * @returns giá trị sau khi chuyển tới bước tiếp theo hoặc null nếu đã ở bước cuối
   */
  public next(): TimeBasedValue | null {
    if (this.currentTimeIndex < this.allTimeData.length - 1) {
      this.currentTimeIndex++;
      return this.getCurrentValue();
    }
    return null; // Đã đạt tới bước cuối cùng
  }
  
  /**
   * Quay lại bước trước đó
   * @returns giá trị sau khi quay lại bước trước đó hoặc null nếu đã ở bước đầu
   */
  public prev(): TimeBasedValue | null {
    if (this.currentTimeIndex > 0) {
      this.currentTimeIndex--;
      return this.getCurrentValue();
    }
    return null; // Đã ở bước đầu tiên
  }
  
  /**
   * Nhảy tới một thời điểm cụ thể
   * @param timeSeconds - Thời điểm cần nhảy tới (giây)
   * @returns giá trị tại thời điểm đó
   */
  public jumpToTime(timeSeconds: number): TimeBasedValue {
    // Tìm index gần nhất với thời gian cần nhảy tới
    const targetTime = Math.min(Math.max(0, timeSeconds), this.totalDurationSeconds);
    
    let closestIndex = 0;
    let smallestDiff = Number.MAX_VALUE;
    
    for (let i = 0; i < this.allTimeData.length; i++) {
      const diff = Math.abs(this.allTimeData[i].timeSeconds - targetTime);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestIndex = i;
      }
    }
    
    this.currentTimeIndex = closestIndex;
    return this.getCurrentValue();
  }
  
  /**
   * Đặt lại về bước đầu tiên
   */
  public reset(): TimeBasedValue {
    this.currentTimeIndex = 0;
    return this.getCurrentValue();
  }
  
  /**
   * Lấy tất cả dữ liệu thời gian
   */
  public getAllTimeData(): TimeBasedValue[] {
    return this.allTimeData;
  }
  
  /**
   * Lấy tổng số bước
   */
  public getTotalSteps(): number {
    return this.allTimeData.length;
  }
  
  /**
   * Lấy chỉ số bước hiện tại
   */
  public getCurrentIndex(): number {
    return this.currentTimeIndex;
  }
  
  /**
   * Chuyển tới bước cuối cùng
   */
  public jumpToEnd(): TimeBasedValue {
    this.currentTimeIndex = this.allTimeData.length - 1;
    return this.getCurrentValue();
  }
}

// Biểu đồ đường cho A và B
function LineChart({ data, currentIndex }: { data: TimeBasedValue[], currentIndex: number }) {
  // Tính toán giá trị max cho tỷ lệ trục Y
  const maxA = 4;
  const maxB = 17;
  const maxValue = Math.max(maxA, maxB);
  
  // Chiều cao và chiều rộng của biểu đồ
  const height = 200;
  const width = 500;
  
  // Tính toán vị trí các điểm trên biểu đồ
  const pointsA = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - (point.a / maxValue) * height;
    return { x, y, value: point.a, time: point.timeSeconds };
  });
  
  const pointsB = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - (point.b / maxValue) * height;
    return { x, y, value: point.b, time: point.timeSeconds };
  });
  
  // Tạo đường path cho đường A và B
  const lineA = `M ${pointsA.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const lineB = `M ${pointsB.map(p => `${p.x},${p.y}`).join(' L ')}`;
  
  // Lấy điểm hiện tại
  const currentPointA = pointsA[currentIndex];
  const currentPointB = pointsB[currentIndex];
  
  return (
    <div className="relative">
      <svg width={width} height={height + 50} className="border rounded">
        {/* Trục X */}
        <line x1="0" y1={height} x2={width} y2={height} stroke="#ccc" />
        
        {/* Trục Y */}
        <line x1="0" y1="0" x2="0" y2={height} stroke="#ccc" />
        
        {/* Đường A */}
        <path d={lineA} fill="none" stroke="blue" strokeWidth="2" />
        
        {/* Đường B */}
        <path d={lineB} fill="none" stroke="red" strokeWidth="2" />
        
        {/* Điểm hiện tại trên đường A */}
        <circle 
          cx={currentPointA.x} 
          cy={currentPointA.y} 
          r="5" 
          fill="blue" 
          stroke="white" 
          strokeWidth="2"
        />
        
        {/* Điểm hiện tại trên đường B */}
        <circle 
          cx={currentPointB.x} 
          cy={currentPointB.y} 
          r="5" 
          fill="red" 
          stroke="white" 
          strokeWidth="2"
        />
        
        {/* Chú thích */}
        <text x="10" y={height + 20} fill="blue">Giá trị A (0-4)</text>
        <text x="10" y={height + 40} fill="red">Giá trị B (0-17)</text>
        
        {/* Đánh dấu thời gian */}
        {[0, 5, 10, 15, 17].map(time => {
          const x = (time / 17) * width;
          return (
            <g key={time}>
              <line x1={x} y1={height} x2={x} y2={height + 5} stroke="#333" />
              <text x={x - 5} y={height + 15} fontSize="10">{time}s</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Component hiển thị thanh tiến trình
function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full bg-gray-200 rounded h-4">
      <div 
        className="bg-blue-600 h-4 rounded" 
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}

// Component hiển thị nút điều khiển
function Controls({ 
  onNext, 
  onPrev, 
  onReset, 
  onEnd,
  onJumpToTime,
  isPlaying,
  onTogglePlay,
  isAtStart,
  isAtEnd
}: { 
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onEnd: () => void;
  onJumpToTime: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isAtStart: boolean;
  isAtEnd: boolean;
}) {
  const [jumpTime, setJumpTime] = useState<string>('');
  
  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const time = parseFloat(jumpTime);
    if (!isNaN(time) && time >= 0 && time <= 17) {
      onJumpToTime(time);
      setJumpTime('');
    }
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2">
        <button 
          onClick={onReset}
          disabled={isAtStart}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          ⏮ Đầu
        </button>
        <button 
          onClick={onPrev}
          disabled={isAtStart}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          ⏪ Lùi
        </button>
        <button 
          onClick={onTogglePlay}
          className={`${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded`}
        >
          {isPlaying ? '⏸ Tạm dừng' : '▶ Phát'}
        </button>
        <button 
          onClick={onNext}
          disabled={isAtEnd}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          ⏩ Tiến
        </button>
        <button 
          onClick={onEnd}
          disabled={isAtEnd}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          ⏭ Cuối
        </button>
      </div>
      
      <form onSubmit={handleJumpSubmit} className="flex space-x-2">
        <input
          type="text"
          value={jumpTime}
          onChange={(e) => setJumpTime(e.target.value)}
          placeholder="Nhập thời gian (0-17)"
          className="border rounded px-3 py-2 w-48"
        />
        <button 
          type="submit" 
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
        >
          Nhảy tới thời điểm
        </button>
      </form>
    </div>
  );
}

// Component hiển thị bảng dữ liệu
function DataTable({ data, currentIndex }: { data: TimeBasedValue[], currentIndex: number }) {
  // Lấy chỉ một phần nhỏ của dữ liệu xung quanh chỉ số hiện tại
  const start = Math.max(0, currentIndex - 2);
  const end = Math.min(data.length - 1, currentIndex + 2);
  const visibleData = data.slice(start, end + 1);
  
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Thời gian (s)</th>
            <th className="px-4 py-2 border">Giá trị A</th>
            <th className="px-4 py-2 border">Giá trị B</th>
            <th className="px-4 py-2 border">% Hoàn thành</th>
          </tr>
        </thead>
        <tbody>
          {visibleData.map((item, index) => (
            <tr 
              key={start + index} 
              className={start + index === currentIndex ? 'bg-blue-100' : ''}
            >
              <td className="px-4 py-2 border">{item.timeSeconds.toFixed(1)}</td>
              <td className="px-4 py-2 border">{item.a.toFixed(2)}</td>
              <td className="px-4 py-2 border">{item.b.toFixed(2)}</td>
              <td className="px-4 py-2 border">{item.percent.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-center text-sm text-gray-500 mt-2">
        Hiển thị dữ liệu {start + 1} đến {end + 1} trong tổng số {data.length} bước
      </div>
    </div>
  );
}

// Component chính của ứng dụng
export default function TimeProgressionApp() {
  // Khởi tạo timeManager
  const timeManagerRef = useRef<TimeProgressionManager>(new TimeProgressionManager());
  
  // State cho giá trị hiện tại
  const [currentValue, setCurrentValue] = useState<TimeBasedValue>(timeManagerRef.current.getCurrentValue());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [allData, setAllData] = useState<TimeBasedValue[]>(timeManagerRef.current.getAllTimeData());
  
  // Xử lý phát tự động
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isPlaying) {
      intervalId = setInterval(() => {
        const next = timeManagerRef.current.next();
        if (next) {
          setCurrentValue(next);
          setCurrentIndex(timeManagerRef.current.getCurrentIndex());
        } else {
          // Dừng lại khi đạt tới cuối
          setIsPlaying(false);
        }
      }, 1000);
    }
    
    // Cleanup interval khi component unmount hoặc isPlaying thay đổi
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying]);
  
  // Các hàm xử lý điều khiển
  const handleNext = () => {
    const next = timeManagerRef.current.next();
    if (next) {
      setCurrentValue(next);
      setCurrentIndex(timeManagerRef.current.getCurrentIndex());
    }
  };
  
  const handlePrev = () => {
    const prev = timeManagerRef.current.prev();
    if (prev) {
      setCurrentValue(prev);
      setCurrentIndex(timeManagerRef.current.getCurrentIndex());
    }
  };
  
  const handleReset = () => {
    const resetValue = timeManagerRef.current.reset();
    setCurrentValue(resetValue);
    setCurrentIndex(timeManagerRef.current.getCurrentIndex());
  };
  
  const handleEnd = () => {
    const endValue = timeManagerRef.current.jumpToEnd();
    setCurrentValue(endValue);
    setCurrentIndex(timeManagerRef.current.getCurrentIndex());
  };
  
  const handleJumpToTime = (time: number) => {
    const jumpValue = timeManagerRef.current.jumpToTime(time);
    setCurrentValue(jumpValue);
    setCurrentIndex(timeManagerRef.current.getCurrentIndex());
  };
  
  const togglePlay = () => {
    // Nếu đang ở cuối và đang dừng, khi nhấn Play thì reset về đầu
    if (!isPlaying && currentIndex === allData.length - 1) {
      handleReset();
    }
    setIsPlaying(!isPlaying);
  };
  
  // Kiểm tra xem đang ở đầu hay cuối
  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex === allData.length - 1;
  
  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Mô phỏng giá trị A (0-4) và B (0-17) theo thời gian</h1>
      
      <div className="mb-6 p-4 bg-white rounded shadow">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-blue-600">A = {currentValue.a.toFixed(2)}</h2>
            <p className="text-sm text-gray-600">Từ 0 đến 4</p>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">B = {currentValue.b.toFixed(2)}</h2>
            <p className="text-sm text-gray-600">Từ 0 đến 17</p>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{currentValue.timeSeconds.toFixed(1)}s</h2>
            <p className="text-sm text-gray-600">{currentValue.percent.toFixed(1)}% hoàn thành</p>
          </div>
        </div>
        
        <div className="mt-4">
          <ProgressBar percent={currentValue.percent} />
        </div>
      </div>
      
      <div className="mb-6">
        <LineChart data={allData} currentIndex={currentIndex} />
      </div>
      
      <div className="mb-6">
        <Controls 
          onNext={handleNext}
          onPrev={handlePrev}
          onReset={handleReset}
          onEnd={handleEnd}
          onJumpToTime={handleJumpToTime}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          isAtStart={isAtStart}
          isAtEnd={isAtEnd}
        />
      </div>
      
      <DataTable data={allData} currentIndex={currentIndex} />
    </div>
  );
}