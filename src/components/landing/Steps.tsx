import { TrackSection } from '@/components/TrackSection';

const steps = [
  {
    num: '01',
    title: 'ลงทะเบียนผู้เช่า',
    desc: 'จัดการข้อมูลผู้เช่าและห้องพักในรูปแบบดิจิทัล จัดเก็บรายละเอียดและโหลดเอกสารสัญญาเข้าสู่ระบบออนไลน์ได้ทันที',
  },
  {
    num: '02',
    title: 'บันทึกมิเตอร์น้ำ-ไฟ',
    desc: 'บันทึกการใช้งานแม่นยำ รวดเร็ว ระบุตัวเลขมิเตอร์ไฟฟ้าผ่านระบบ แล้วให้ระบบคำนวณค่าใช้จ่ายตามอัตราที่คุณกำหนดโดยอัตโนมัติ',
  },
  {
    num: '03',
    title: 'ออกบิลอัตโนมัติ',
    desc: 'สร้างใบแจ้งหนี้มืออาชีพเพียงคลิกเดียว ระบบจะสร้างใบแจ้งหนี้ที่สวยงามและถูกต้อง ส่งถึงผู้เช่าผ่านทาง Email หรือ SMS ได้ทันที',
  },
  {
    num: '04',
    title: 'รับยอดและอัปเดตสถานะ',
    desc: 'ติดตามทุกยอดชำระอย่างไร้รอยต่อ แจ้งเตือนทันทีเมื่อมีผู้เช่าชำระเงิน พร้อมอัปเดตยอดคงเหลือในระบบ Real-time ให้คุณบริหารกระแสเงินสดได้อย่างสบายใจ',
  },
];

export function Steps() {
  return (
    <TrackSection id="how" label="วิธีใช้งาน" className="bg-secondary-2 section-pad">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          {/* <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-secondary">ขั้นตอน</div> */}
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl lg:text-5xl">
            ขั้นตอนการทำงาน
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-ink-muted">
            ออกแบบมาเพื่อประหยัดเวลาให้คุณในทุกสัปดาห์
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              <div className="font-display text-6xl font-extrabold leading-none text-secondary/10">
                {s.num}
              </div>
              <h3 className="mb-2 mt-4 font-display text-base font-semibold text-ink">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="absolute left-full top-7 hidden h-px w-full bg-gradient-to-r from-secondary/40 to-transparent lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </TrackSection>
  );
}
