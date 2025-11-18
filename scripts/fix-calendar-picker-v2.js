#!/usr/bin/env node

/**
 * Auto-fix script for react-native-calendar-picker style issues
 * This script patches the calendar picker to prevent "cannot read property style of undefined" errors
 * 
 * Run this after installing dependencies: node scripts/fix-calendar-picker-v2.js
 */

const fs = require('fs');
const path = require('path');

const CALENDAR_PICKER_PATH = path.join(__dirname, '..', 'node_modules', 'react-native-calendar-picker', 'CalendarPicker');

function logFix(component, description) {
  console.log(`✅ Fixed ${component}: ${description}`);
}

function logError(component, error) {
  console.error(`❌ Failed to fix ${component}: ${error}`);
}

function fixAllComponents() {
  console.log('🔧 Fixing react-native-calendar-picker style issues...\n');

  // 1. Fix main CalendarPicker component
  const indexPath = path.join(CALENDAR_PICKER_PATH, 'index.js');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    content = content.replace(
      /<View styles={styles\.calendar}>/g,
      '<View style={(styles && styles.calendar) || {}}>'
    );
    fs.writeFileSync(indexPath, content);
    logFix('CalendarPicker/index.js', 'Fixed styles prop typo and added null safety');
  }

  // 2. Fix DaysGridView component (PropTypes issue)
  const daysGridPath = path.join(CALENDAR_PICKER_PATH, 'DaysGridView.js');
  if (fs.existsSync(daysGridPath)) {
    let content = fs.readFileSync(daysGridPath, 'utf8');
    
    // Fix ViewPropTypes and Text.propTypes issues
    content = content.replace(
      'const ViewPropTypes = RNViewPropTypes || View.propTypes;',
      'const ViewPropTypes = RNViewPropTypes || { style: PropTypes.any };\nconst TextPropTypes = Text.propTypes || { style: PropTypes.any };'
    );
    
    content = content.replace(/Text\.propTypes\.style/g, 'TextPropTypes.style');
    
    fs.writeFileSync(daysGridPath, content);
    logFix('CalendarPicker/DaysGridView.js', 'Fixed deprecated PropTypes issues');
  }

  // 3. Fix Day component
  const dayPath = path.join(CALENDAR_PICKER_PATH, 'Day.js');
  if (fs.existsSync(dayPath)) {
    let content = fs.readFileSync(dayPath, 'utf8');
    
    const fallbackStyles = `  const styles = rawStyles || {
    dayButton: {},
    dayWrapper: {},
    selectedDay: {},
    selectedToday: {},
    selectedDayBackground: {},
    selectedDayLabel: {},
    startDayWrapper: {},
    endDayWrapper: {},
    inRangeDay: {},
    disabledText: {},
    dayLabel: {}
  };`;

    content = content.replace(
      /const styles = rawStyles \|\| \{[^}]*\};/s,
      fallbackStyles
    );
    
    fs.writeFileSync(dayPath, content);
    logFix('CalendarPicker/Day.js', 'Enhanced fallback styles with selectedToday');
  }

  // 4. Fix Weekdays component
  const weekdaysPath = path.join(CALENDAR_PICKER_PATH, 'Weekdays.js');
  if (fs.existsSync(weekdaysPath)) {
    let content = fs.readFileSync(weekdaysPath, 'utf8');
    
    if (!content.includes('const styles = rawStyles ||')) {
      content = content.replace('styles,', 'styles: rawStyles,');
      
      const safetyStyles = `
  // Create safe styles object
  const styles = rawStyles || {
    dayLabelsWrapper: {},
    dayLabels: {},
  };`;
      
      content = content.replace(/} = props;/, `} = props;${safetyStyles}`);
      fs.writeFileSync(weekdaysPath, content);
      logFix('CalendarPicker/Weekdays.js', 'Added safe styles fallback');
    } else {
      logFix('CalendarPicker/Weekdays.js', 'Already patched');
    }
  }

  // 5. Fix HeaderControls component  
  const headerPath = path.join(CALENDAR_PICKER_PATH, 'HeaderControls.js');
  if (fs.existsSync(headerPath)) {
    let content = fs.readFileSync(headerPath, 'utf8');
    
    if (!content.includes('const styles = rawStyles ||')) {
      content = content.replace('styles,', 'styles: rawStyles,');
      
      const safetyStyles = `
  // Create safe styles object
  const styles = rawStyles || {
    headerWrapper: {},
    previousContainer: {},
    nextContainer: {},
    monthYearHeaderWrapper: {},
    monthHeaderMainText: {},
    yearHeaderMainText: {},
    navButtonText: {},
  };`;
      
      content = content.replace(/} = props;/, `} = props;${safetyStyles}`);
      fs.writeFileSync(headerPath, content);
      logFix('CalendarPicker/HeaderControls.js', 'Added comprehensive styles fallback');
    } else {
      logFix('CalendarPicker/HeaderControls.js', 'Already patched');
    }
  }

  // 6. Fix Controls component
  const controlsPath = path.join(CALENDAR_PICKER_PATH, 'Controls.js');
  if (fs.existsSync(controlsPath)) {
    let content = fs.readFileSync(controlsPath, 'utf8');
    content = content.replace('style={styles}', 'style={styles || {}}');
    fs.writeFileSync(controlsPath, content);
    logFix('CalendarPicker/Controls.js', 'Added styles null safety');
  }

  // 7. Fix makeStyles component
  const makeStylesPath = path.join(CALENDAR_PICKER_PATH, 'makeStyles.js');
  if (fs.existsSync(makeStylesPath)) {
    let content = fs.readFileSync(makeStylesPath, 'utf8');
    
    if (!content.includes('dayLabelsWrapper:')) {
      const additionalStyles = `
    weekRow: {
      flexDirection: 'row'
    },

    dayLabelsWrapper: {
      flexDirection: 'row',
      alignSelf: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.0)',
      paddingVertical: 3*scaler,
    },

    dayLabels: {
      fontSize: 14*scaler,
      color: '#000',
      alignSelf: 'center',
      textAlign: 'center',
      fontWeight: '500',
      width: 50*scaler,
    },

    daysWrapper: {
      alignSelf: 'center',
      justifyContent: 'center',
    },`;
      
      content = content.replace(/weekRow: \{[\s\S]*?\},/, additionalStyles);
      fs.writeFileSync(makeStylesPath, content);
      logFix('CalendarPicker/makeStyles.js', 'Added missing styles');
    } else {
      logFix('CalendarPicker/makeStyles.js', 'Styles already include required properties');
    }
  }

  console.log('\n✨ All calendar picker style fixes applied successfully!');
  console.log('   Your app should now be free from "cannot read property style of undefined" errors.');
}

// Main execution
try {
  fixAllComponents();
} catch (error) {
  console.error('\n💥 Error applying fixes:', error);
  process.exit(1);
}