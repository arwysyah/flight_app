import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { wp, fs, spacing } from '../utils/responsive';

interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder = 'Select date',
}) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleIOSConfirm = () => {
    onChange(tempDate);
    setShow(false);
  };

  const handleIOSCancel = () => {
    setShow(false);
    setTempDate(value || new Date());
  };

  const formatDisplayDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, !value && styles.placeholderText]}>
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {show && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={show}
          onRequestClose={handleIOSCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleIOSCancel}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text style={[styles.modalButton, styles.confirmButton]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#5f6368',
    marginBottom: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: wp(8),
    padding: spacing.sm + spacing.xs,
    backgroundColor: '#fff',
  },
  buttonText: {
    fontSize: fs(16),
    color: '#202124',
  },
  placeholderText: {
    color: '#9aa0a6',
  },
  icon: {
    fontSize: fs(20),
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: wp(20),
    borderTopRightRadius: wp(20),
    paddingBottom: spacing.xl + 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#202124',
  },
  modalButton: {
    fontSize: fs(16),
    color: '#1a73e8',
  },
  confirmButton: {
    fontWeight: '600',
  },
  iosPicker: {
    height: wp(200),
  },
});
