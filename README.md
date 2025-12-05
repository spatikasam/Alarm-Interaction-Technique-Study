# Alarm Interaction Technique Study

A controlled user study comparing two interaction techniques for navigating iPhone alarm lists: traditional vertical scrolling vs. a radial clock-wheel interface.

## Research Question

How does the interaction technique (Scroll vs. Radial Clock-Wheel), list length (10, 20, or 30 alarms), and target alarm position (Top, Middle, Bottom) affect task completion time, perceived mental effort, and error rate?

## Study Design

**Within-subjects experiment** with 54 trials across 3 blocks (18 trials per block).

**Independent Variables:**
- **Technique:** Scroll (standard iOS) or Radial Clock-Wheel
- **List Length:** 10, 20, or 30 alarms
- **Target Position:** Top, Middle, or Bottom third of list

**Dependent Measures:**
- **Task Completion Time** (milliseconds)
- **Mental Effort** (NASA-TLX scale: 0–100)
- **Error Count** (incorrect selections before finding target)

**Task:** Participants locate and select a highlighted target alarm as quickly and accurately as possible.

**Procedure:**
1. Practice trials (6) to familiarize with both techniques
2. Main experiment (54 trials) with randomized conditions
3. Breaks: 3 seconds between trials, 40 seconds between blocks
4. Post-experiment questionnaire

## Design Rationale

Standard iOS alarm lists require repetitive scrolling to access alarms in long lists, particularly those in the middle or bottom positions. The radial clock-wheel technique offers an alternative navigation method using a spatial metaphor—a circular dial representing 24 hours that allows direct access to any time position with a single rotational gesture.

## Demo

**Practice Session:** https://spatikasam.github.io/Alarm-Interaction-Technique-Study/practice.html

**Main Experiment:** https://spatikasam.github.io/Alarm-Interaction-Technique-Study/experiment.html

## Project Structure

- `practice.html` - Practice session (6 trials to learn both techniques)
- `experiment.html` - Main study (54 trials with data logging)
- `styles.css` - iOS-style interface design
- `script.js` - Radial dial interaction logic
- `test-sheet.html` - Data logging test utility
- `README.md` - Study documentation

## Data Collection

Trial data is automatically logged to Google Sheets including:
- Participant ID, technique, list length, target position
- Block number, trial number, timestamps
- Task duration, mental effort rating, error count
- Target alarm time

## Technical Features

- **Responsive iOS mockup** with realistic alarm UI
- **Radial clock-wheel** with smooth rotation and AM/PM indicators
- **Automatic trial randomization** with counterbalancing
- **Real-time performance tracking** with 30-second timeout per trial
- **Break management** with countdown timers
- **Cross-origin data logging** to Google Sheets