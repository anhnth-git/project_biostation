import { faker } from '@faker-js/faker';

// Julian Date: ngày thứ n trong năm (offset = số ngày lệch hôm nay)
export const getJulianDate = (offset = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date.getTime() - startOfYear.getTime()) / 86400000).toString().padStart(3, '0');
};

const today = 0;
export const julianToday = getJulianDate(today);

// buildBarcode(offset, departure, arrival, seat) — tất cả có default
const buildBarcode = (offset = 0, departure = 'SGN', arrival = 'DLI', seat = '010B'): string => {
    const julian = getJulianDate(offset);
    const pnr = faker.string.alphanumeric({ length: 7, casing: 'upper' });
    return `M1LE/PHUC ANH         ${pnr} ${departure}${arrival}VN 1381 ${julian}Y${seat}0002  23>118   6${julian}BVN 00000000000000012299`;
};


export const data = {
    datacase1: {
        "barcode": buildBarcode(today),
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase2: {
        "barcode": buildBarcode(today),     // ngày hiện tại
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase3: {
        "barcode": buildBarcode(today - 2), // ngày hiện tại - 2
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase4: {
        "barcode": buildBarcode(today + 2), // ngày hiện tại + 2
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase5: {
        "barcode": buildBarcode(today + 1), // ngày hiện tại + 1
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase6: {
        "barcode": buildBarcode(today - 1), // ngày hiện tại - 1
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase7: {
        "barcode": "E1LE/PHUCANH           LH8W9P HANSGNVN 1187 120Y001A0025 106>10000",
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase8: {
        "barcode": buildBarcode(today, 'HUI'), // cảng đi HUI thay vì cảng cấu hình
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase9: {
        "barcode": buildBarcode(today, 'SGN', 'BKK'), // giữ DLI, đổi cảng đến thành quốc tế
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase10: {
        "barcode": buildBarcode(today, /*departure*/ 'SGN', /*arrival*/ 'DLI', /*seat*/ 'INFANT'), // số ghế chỉ là số
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase11: {
        "barcode": false as any, // test: barcode là number thay vì string → server trả lỗi "Cannot get the value of a token type 'Number' as a string."
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase12: {
        "barcode": buildBarcode(),
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string",
        "passengerId": "string",
    },

    datacase13: {
        "barcode": buildBarcode(),
        "computerName": true,
        "nameIdentity": "string",
        "verifyBoardingPass": "string",
        "passengerId": "string",
    },

    datacase14: {
        "barcode": buildBarcode(),
        "computerName": "string",
        "nameIdentity": true,
        "verifyBoardingPass": "string",
        "passengerId": "string",
    },

    datacase15: {
        "barcode": buildBarcode(),
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": true,
        "passengerId": "string",
    },

    datacase16: {
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase17: {
        "barcode": buildBarcode(),
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },

    datacase18: {
        "barcode": buildBarcode(today),
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string",
        "role": "admin",
        "isVerified": true
    },

    datacase22: {
        "barcode": [buildBarcode(today), buildBarcode(today)] as any, // barcode là array thay vì string → sai cấu trúc
        "computerName": "string",
        "nameIdentity": "string",
        "verifyBoardingPass": "string"
    },
};

