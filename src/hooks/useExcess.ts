// Giá trị ban đầu và giá trị đích
const aStart = 0;
const aEnd = 4;
const bStart = 0;
const bEnd = 17;
const totalDurationSeconds = 17;

// Interface cho mỗi bản ghi dữ liệu
interface TimeBasedValue {
  a: number;
  b: number;
  timeSeconds: number;
  percent: number;
}

/**
 * Tính toán giá trị a và b tại một thời điểm cụ thể
 */
function calculateValuesAtTime(timeSeconds: number): TimeBasedValue {
  // Đảm bảo thời gian không vượt quá tổng thời gian
  const clampedTime = Math.min(timeSeconds, totalDurationSeconds);
  
  // Tính phần trăm hoàn thành
  const percent = (clampedTime / totalDurationSeconds) * 100;
  
  // Tính toán giá trị a và b dựa trên thời gian
  const a = aStart + ((aEnd - aStart) * clampedTime / totalDurationSeconds);
  const b = bStart + ((bEnd - bStart) * clampedTime / totalDurationSeconds);
  
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
 * Mô phỏng và ghi lại dữ liệu theo từng khoảng thời gian
 * @param intervalMs - Khoảng thời gian giữa các lần ghi dữ liệu (mili giây)
 * @returns Promise với dữ liệu được ghi lại
 */
export function simulateTimeProgressionAsync(intervalMs: number = 1000): Promise<TimeBasedValue[]> {
  return new Promise((resolve) => {
    const data: TimeBasedValue[] = [];
    let currentTime = 0;
    
    console.log("Bắt đầu mô phỏng thời gian từ 0 đến 17 giây...");
    console.log("Thời gian (s) | a     | b      | % Hoàn thành");
    console.log("------------- | ----- | ------ | ------------");
    
    // Thêm giá trị tại thời điểm 0
    const initialValue = calculateValuesAtTime(0);
    data.push(initialValue);
    console.log(`${initialValue.timeSeconds.toFixed(1).padStart(13)} | ${initialValue.a.toFixed(2)} | ${initialValue.b.toFixed(2).padStart(6)} | ${initialValue.percent.toFixed(1).padStart(5)}%`);
    
    // Thiết lập interval để cập nhật giá trị sau mỗi khoảng thời gian
    const intervalId = setInterval(() => {
      // Tăng thời gian
      currentTime += intervalMs / 1000;
      
      // Kiểm tra nếu đã đạt tới thời gian tối đa
      if (currentTime > totalDurationSeconds) {
        clearInterval(intervalId);
        resolve(data);
        return;
      }
      
      // Tính toán giá trị mới
      const values = calculateValuesAtTime(currentTime);
      data.push(values);
      
      // Hiển thị giá trị
      console.log(`${values.timeSeconds.toFixed(1).padStart(13)} | ${values.a.toFixed(2)} | ${values.b.toFixed(2).padStart(6)} | ${values.percent.toFixed(1).padStart(5)}%`);
    }, intervalMs);
  });
}

/**
 * Tạo trước bộ dữ liệu cho toàn bộ thời gian (không cần đợi thời gian thực)
 */
function generateTimeBasedData(): TimeBasedValue[] {
  const data: TimeBasedValue[] = [];
  
  // Tạo dữ liệu cho mỗi giây
  for (let second = 0; second <= totalDurationSeconds; second++) {
    data.push(calculateValuesAtTime(second));
  }
  
  return data;
}

/**
 * Tạo dữ liệu cho các mốc thời gian cụ thể (chi tiết hơn)
 */
function generateDetailedTimeData(): TimeBasedValue[] {
  const data: TimeBasedValue[] = [];
  
  // Tạo dữ liệu chi tiết hơn (cứ mỗi 0.1 giây)
  for (let tenthSecond = 0; tenthSecond <= totalDurationSeconds * 10; tenthSecond++) {
    const second = tenthSecond / 10;
    data.push(calculateValuesAtTime(second));
  }
  
  return data;
}

// === CHẠY CHƯƠNG TRÌNH ===

// 1. Tạo dữ liệu theo từng giây (không chạy theo thời gian thực)
const secondBySecondData = generateTimeBasedData();
console.log("Dữ liệu theo từng giây:");
console.table(secondBySecondData);

// 2. Tạo dữ liệu chi tiết theo mỗi 0.1 giây
const detailedData = generateDetailedTimeData();
console.log(`\nDữ liệu chi tiết (${detailedData.length} mốc thời gian):`);
console.log("(Chỉ hiển thị 10 mốc đầu tiên):");
console.table(detailedData.slice(0, 10));

// 3. Mô phỏng thời gian thực (sử dụng khi chạy trong môi trường Node.js)
console.log("\nMô phỏng thời gian thực (cập nhật mỗi giây):");

// Để chạy mô phỏng thời gian thực, bỏ comment dòng dưới đây
simulateTimeProgressionAsync(1000).then(data => console.log("Mô phỏng hoàn tất với", data.length, "mẫu dữ liệu"));

// Chỉ hiển thị kết quả mô phỏng cho máy ảo trình duyệt
console.log("\nMô phỏng chạy trong môi trường thời gian thực (mỗi 1 giây):");
simulateRealTimeDisplay();

// Hàm giả lập hiển thị thời gian thực (cho môi trường không hỗ trợ async)
function simulateRealTimeDisplay() {
  for (let second = 0; second <= totalDurationSeconds; second++) {
    const value = calculateValuesAtTime(second);
    console.log(`Giây ${value.timeSeconds}: a = ${value.a.toFixed(2)}, b = ${value.b.toFixed(2)} (${value.percent}% hoàn thành)`);
  }
}

// Xuất dữ liệu dưới dạng JSON
const jsonData = {
  perSecondData: secondBySecondData,
  // detailedData: detailedData // Bỏ comment nếu cần xuất dữ liệu chi tiết
};

console.log("\nDữ liệu JSON:");
console.log(JSON.stringify(jsonData, null, 2));

// === PHẦN MỞ RỘNG: TRỰC QUAN HÓA DỮ LIỆU BẰNG ASCII ===

console.log("\n=== BIỂU ĐỒ TRỰC QUAN HÓA SỰ THAY ĐỔI GIỮA a VÀ b ===");
plotProgressionChart(secondBySecondData);

// Hàm vẽ biểu đồ ASCII đơn giản
function plotProgressionChart(data: TimeBasedValue[]) {
  const width = 50; // Chiều rộng biểu đồ
  
  // Vẽ biểu đồ cho giá trị a
  console.log("\nSự thay đổi của giá trị a (0->4):");
  data.forEach(point => {
    const normalizedA = (point.a - aStart) / (aEnd - aStart); // Chuẩn hóa về 0-1
    const barLength = Math.round(normalizedA * width);
    const bar = "=".repeat(barLength) + ">";
    console.log(`[${point.timeSeconds.toFixed(0).padStart(2)}s] ${bar.padEnd(width + 1)} ${point.a.toFixed(2)}`);
  });
  
  // Vẽ biểu đồ cho giá trị b
  console.log("\nSự thay đổi của giá trị b (0->17):");
  data.forEach(point => {
    const normalizedB = (point.b - bStart) / (bEnd - bStart); // Chuẩn hóa về 0-1
    const barLength = Math.round(normalizedB * width);
    const bar = "=".repeat(barLength) + ">";
    console.log(`[${point.timeSeconds.toFixed(0).padStart(2)}s] ${bar.padEnd(width + 1)} ${point.b.toFixed(2)}`);
  });
}