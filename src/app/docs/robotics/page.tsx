'use client';

import { FadeInUp } from '@/components/motion';

export default function RoboticsDocsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px] py-24 md:pt-[138.641px]" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <FadeInUp>
          <h1 className="text-black text-4xl sm:text-5xl md:text-[56px] leading-tight mb-8" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-2.24px',
            color: 'rgb(0, 0, 0)',
          }}>
            Robotics Vision
          </h1>
        </FadeInUp>

        <div className="space-y-6 mb-12" style={{ maxWidth: '800px' }}>
          <FadeInUp>
            <p className="text-gray-700 leading-relaxed text-lg" style={{
              fontWeight: 400,
              fontFamily: 'BaselGrotesk-Regular, sans-serif',
              lineHeight: '1.6',
              color: 'rgb(0, 0, 0)'
            }}>
              The machine economy won't run on subscriptions. Robots, agents, and APIs need to buy capabilities in bursts—per request, per frame, per minute. R1x makes HTTP machine‑payable so autonomy can scale without contracts or accounts.
            </p>
          </FadeInUp>

          <FadeInUp>
            <p className="text-gray-700 leading-relaxed text-lg" style={{
              fontWeight: 400,
              fontFamily: 'BaselGrotesk-Regular, sans-serif',
              lineHeight: '1.6',
              color: 'rgb(0, 0, 0)'
            }}>
              In robotics, value happens at the edge and in spikes. A robot shouldn't rent a month of vision or maps to unlock five seconds of capability. With R1x, one request carries a price, you pay in dollars, you get a verifiable receipt. That's it.
            </p>
          </FadeInUp>
        </div>

        <FadeInUp>
          <h2 className="text-black text-3xl sm:text-4xl md:text-[40px] leading-tight mb-6 mt-12" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.6px',
            color: 'rgb(0, 0, 0)',
          }}>
            Use Cases
          </h2>
        </FadeInUp>

        <div className="space-y-4 mb-12" style={{ maxWidth: '800px' }}>
          <FadeInUp>
            <ul className="space-y-4 list-none" style={{ paddingLeft: '0' }}>
              <li className="flex items-start">
                <span className="text-[#FF4D00] mr-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>→</span>
                <span className="text-gray-700 leading-relaxed text-lg" style={{
                  fontWeight: 400,
                  fontFamily: 'BaselGrotesk-Regular, sans-serif',
                  lineHeight: '1.6',
                  color: 'rgb(0, 0, 0)'
                }}>
                  <strong>Per‑frame perception and OCR:</strong> Call vision or OCR only when needed; pay cents per frame. No monthly subscriptions for capabilities you use sporadically.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#FF4D00] mr-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>→</span>
                <span className="text-gray-700 leading-relaxed text-lg" style={{
                  fontWeight: 400,
                  fontFamily: 'BaselGrotesk-Regular, sans-serif',
                  lineHeight: '1.6',
                  color: 'rgb(0, 0, 0)'
                }}>
                  <strong>Route planning and HD map tiles per call:</strong> Buy HD tiles and routing per segment; no monthly lock‑in. Purchase navigation data exactly when you need it.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#FF4D00] mr-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>→</span>
                <span className="text-gray-700 leading-relaxed text-lg" style={{
                  fontWeight: 400,
                  fontFamily: 'BaselGrotesk-Regular, sans-serif',
                  lineHeight: '1.6',
                  color: 'rgb(0, 0, 0)'
                }}>
                  <strong>Teleop fallback by the minute:</strong> Escalate to human control by the minute during edge cases. Pay for teleoperation only when autonomy fails.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#FF4D00] mr-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>→</span>
                <span className="text-gray-700 leading-relaxed text-lg" style={{
                  fontWeight: 400,
                  fontFamily: 'BaselGrotesk-Regular, sans-serif',
                  lineHeight: '1.6',
                  color: 'rgb(0, 0, 0)'
                }}>
                  <strong>Sensor data windows (LiDAR/IMU) on demand:</strong> Publish or consume LiDAR/IMU windows on demand. Access sensor data streams per time window, not per subscription.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[#FF4D00] mr-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>→</span>
                <span className="text-gray-700 leading-relaxed text-lg" style={{
                  fontWeight: 400,
                  fontFamily: 'BaselGrotesk-Regular, sans-serif',
                  lineHeight: '1.6',
                  color: 'rgb(0, 0, 0)'
                }}>
                  <strong>Charging slot reservations and fleet telemetry access:</strong> Reserve slots and settle once confirmed. Pay for infrastructure access per use, not per month.
                </span>
              </li>
            </ul>
          </FadeInUp>
        </div>

        <FadeInUp>
          <h2 className="text-black text-3xl sm:text-4xl md:text-[40px] leading-tight mb-6 mt-12" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.6px',
            color: 'rgb(0, 0, 0)',
          }}>
            Why Per‑Request Pricing Matters
          </h2>
        </FadeInUp>

        <div className="space-y-6 mb-12" style={{ maxWidth: '800px' }}>
          <FadeInUp>
            <p className="text-gray-700 leading-relaxed text-lg" style={{
              fontWeight: 400,
              fontFamily: 'BaselGrotesk-Regular, sans-serif',
              lineHeight: '1.6',
              color: 'rgb(0, 0, 0)'
            }}>
              Robotics workloads are inherently spiky. A delivery robot might need intensive mapping for 30 seconds, then navigate autonomously for hours. A warehouse bot might require OCR for package sorting during peak hours, then idle for the rest of the day.
            </p>
          </FadeInUp>

          <FadeInUp>
            <p className="text-gray-700 leading-relaxed text-lg" style={{
              fontWeight: 400,
              fontFamily: 'BaselGrotesk-Regular, sans-serif',
              lineHeight: '1.6',
              color: 'rgb(0, 0, 0)'
            }}>
              Traditional subscription models force you to pay for capacity you rarely use. R1x's per‑request pricing matches the reality of robotic operations: pay for what you consume, when you consume it. Every transaction is verifiable on‑chain, giving you complete transparency into operational costs.
            </p>
          </FadeInUp>
        </div>
      </div>
    </div>
  );
}

