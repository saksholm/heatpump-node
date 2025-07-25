import { GLOBALS } from '../globals';
import { HP } from '../hp';
import { TH } from '../th';
import { DO } from '../do';

export const hpStatus = () => {
    console.log("\n" + "=".repeat(80));
    console.log("HEAT PUMP STATUS REPORT");
    console.log("=".repeat(80));

    // System Status
    console.log("\n📊 SYSTEM STATUS");
    console.log("─".repeat(40));
    console.log(`Status:           ${GLOBALS.status.padEnd(20)} | HP Mode:     ${HP.mode.padEnd(15)}`);
    console.log(`Program:          ${HP.program.padEnd(20)} | Running:     ${HP.running.toString().padEnd(15)}`);
    console.log(`Manual Mode:      ${HP.manual.toString().padEnd(20)} | Prevent Run: ${GLOBALS.preventRun.toString().padEnd(15)}`);
    console.log(`Dry Run:          ${GLOBALS.dryRun.toString().padEnd(20)} | Emergency:   ${HP.emergencyShutdown.toString().padEnd(15)}`);
    console.log(`Alarm A:          ${HP.alarmA.toString().padEnd(20)} | Alarm B:     ${HP.alarmB.toString().padEnd(15)}`);
    if (HP.alarmAReason) console.log(`Alarm A Reason:   ${HP.alarmAReason.padEnd(20)}`);
    if (HP.alarmBReason) console.log(`Alarm B Reason:   ${HP.alarmBReason.padEnd(20)}`);

    // Temperature Sensors
    console.log("\n🌡️  TEMPERATURES (°C)");
    console.log("─".repeat(40));
    console.log(`Outside Air:      ${TH.outside.value.toFixed(1).padStart(6)}°C | Exhaust:        ${TH.exhaust.value.toFixed(1).padStart(6)}°C`);
    console.log(`Before CHG:       ${TH.beforeCHG.value.toFixed(1).padStart(6)}°C | Between CHG-CX: ${TH.betweenCHG_CX.value.toFixed(1).padStart(6)}°C`);
    console.log(`Between CX-Fan:   ${TH.betweenCX_FAN.value.toFixed(1).padStart(6)}°C | AHU Supply:     ${TH.ahuCirculationSupply.value.toFixed(1).padStart(6)}°C`);
    console.log(`Hotgas:           ${TH.hotgas.value.toFixed(1).padStart(6)}°C | HX In:          ${TH.hxIn.value.toFixed(1).padStart(6)}°C`);
    console.log(`HX Out:           ${TH.hxOut.value.toFixed(1).padStart(6)}°C | Glycol In:      ${TH.glygolIn.value.toFixed(1).padStart(6)}°C`);
    console.log(`Glycol Out:       ${TH.glygolOut.value.toFixed(1).padStart(6)}°C | Boiler Upper:   ${TH.boilerUpper.value.toFixed(1).padStart(6)}°C`);
    console.log(`Boiler Middle:    ${TH.boilerMiddle.value.toFixed(1).padStart(6)}°C | Boiler Lower:   ${TH.boilerLower.value.toFixed(1).padStart(6)}°C`);

    // Output Percentages
    console.log("\n⚡ OUTPUTS (%)");
    console.log("─".repeat(40));
    console.log(`HP Output:        ${DO.hpOutput.value.toString().padStart(3)}% | HP Fan:         ${DO.hpFanOutput.value.toString().padStart(3)}%`);
    console.log(`AHU Fan:          ${DO.ahuFanOutput.value.toString().padStart(3)}% | Load 2-Way:     ${DO.load2Way.value.toString().padStart(3)}%`);

    // Relay States
    console.log("\n🔌 RELAY STATES");
    console.log("─".repeat(40));
    console.log(`AHU Fan:          ${DO.ahuFan.value.padEnd(10)} | HP Allowed:     ${DO.hpAllowed.value.padEnd(10)}`);
    console.log(`Damper Outside:   ${DO.damperOutside.value.padEnd(10)} | Damper Conv:    ${DO.damperConvection.value.padEnd(10)}`);
    console.log(`Water Pump:       ${DO.waterpumpCharging.value.padEnd(10)} | CHG Pump:       ${DO.chgPumpRequest.value.padEnd(10)}`);
    console.log(`HP 4-Way Valve:   ${DO.hp4Way.value.padEnd(10)} | HP Fan:         ${DO.hpFan.value.padEnd(10)}`);

    // Setpoints & Limits
    console.log("\n🎯 SETPOINTS & LIMITS");
    console.log("─".repeat(40));
    console.log(`HX Out Target:    ${HP.hxOutTarget.toString().padStart(6)}°C | Max Hotgas:     ${HP.maxHotgas.toString().padStart(6)}°C`);
    console.log(`HX In Maximum:    ${HP.hxInMaximum.toString().padStart(6)}°C | Cooling Target: ${GLOBALS.coolingTargetTemp.toString().padStart(6)}°C`);
    console.log(`Boiler Upper Min: ${GLOBALS.boiler.upper.softMinimum.toString().padStart(6)}°C | Boiler Upper Max: ${GLOBALS.boiler.upper.softMaximum.toString().padStart(6)}°C`);
    console.log(`Boiler Middle Min:${GLOBALS.boiler.middle.softMinimum.toString().padStart(6)}°C | Boiler Middle Max: ${GLOBALS.boiler.middle.softMaximum.toString().padStart(6)}°C`);
    console.log(`Boiler Lower Min: ${GLOBALS.boiler.lower.softMinimum.toString().padStart(6)}°C | Boiler Lower Max: ${GLOBALS.boiler.lower.softMaximum.toString().padStart(6)}°C`);

    // Operating Modes
    console.log("\n🔄 OPERATING MODES");
    console.log("─".repeat(40));
    console.log(`HVAC Cooling:     ${GLOBALS.hvacCooling.toString().padEnd(10)} | HVAC Drying:     ${GLOBALS.hvacDrying.toString().padEnd(10)}`);
    console.log(`HVAC Heating:     ${GLOBALS.hvacHeating.toString().padEnd(10)} | Heat to Water:  ${GLOBALS.heatToWater.toString().padEnd(10)}`);
    console.log(`Heat to Ground:   ${GLOBALS.heatToGround.toString().padEnd(10)} | Heat to Air:     ${GLOBALS.heatToAir.toString().padEnd(10)}`);
    console.log(`Ground > Air:     ${GLOBALS.groundWarmerThanAir.toString().padEnd(10)} | Boost Hot Water: ${GLOBALS.boostHotWater.toString().padEnd(10)}`);

    // Night Electricity
    console.log("\n🌙 NIGHT ELECTRICITY");
    console.log("─".repeat(40));
    console.log(`Active:           ${GLOBALS.nightElectricity.active.toString().padEnd(10)} | Demand:         ${GLOBALS.nightElectricity.demand.toString().padEnd(10)}`);
    console.log(`Hours:            ${GLOBALS.nightElectricity.startHour.toString().padStart(2)}:00-${GLOBALS.nightElectricity.endHour.toString().padStart(2)}:00`);

    // Dynamic HP Output
    if (HP.dynamicHPOutput) {
        console.log("\n📈 DYNAMIC HP OUTPUT (ACTIVE)");
        console.log("─".repeat(40));
        console.log(`Heating Temps:    [${HP.dynamicHPOutputParams.heating.temperatures.join(', ')}]°C`);
        console.log(`Heating Values:   [${HP.dynamicHPOutputParams.heating.values.join(', ')}]%`);
        console.log(`Cooling Temps:    [${HP.dynamicHPOutputParams.cooling.temperatures.join(', ')}]°C`);
        console.log(`Cooling Values:   [${HP.dynamicHPOutputParams.cooling.values.join(', ')}]%`);
    }

    // Timestamps
    console.log("\n⏰ TIMESTAMPS");
    console.log("─".repeat(40));
    const now = Math.floor(Date.now() / 1000);
    console.log(`Uptime:           ${Math.floor((now - GLOBALS.startupTimestamp) / 60)} minutes`);
    if (HP.actualRunStartTimestamp > 0) {
        console.log(`HP Run Time:      ${Math.floor((now - HP.actualRunStartTimestamp) / 60)} minutes`);
    }
    if (HP.lastStopTime > 0) {
        console.log(`Last Stop:        ${Math.floor((now - HP.lastStopTime) / 60)} minutes ago`);
    }

    console.log("\n" + "=".repeat(80));
}; 