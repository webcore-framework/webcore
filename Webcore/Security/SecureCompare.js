class SecureCompare {


    compareBytes(buffer1, buffer2) {
        const a = buffer1 instanceof Uint8Array ? buffer1 : new Uint8Array(buffer1);
        const b = buffer2 instanceof Uint8Array ? buffer2 : new Uint8Array(buffer2);

        const lenA = a.length;
        const lenB = b.length;

        // 1. 先比较长度（但还是要进行完整比较）
        let result = lenA ^ lenB; // 如果长度不同，result 不为 0

        // 2. 比较每个字节（恒定时间）
        // 使用最大长度，确保比较时间只取决于最大长度，而不是实际差异位置
        const maxLen = Math.max(lenA, lenB);

        for (let i = 0; i < maxLen; i++) {
            // 如果索引超出数组范围，使用 0 作为默认值
            const byteA = i < lenA ? a[i] : 0;
            const byteB = i < lenB ? b[i] : 0;

            // 使用位异或和位或操作
            // 如果有任何字节不同，result 就不为 0
            result |= byteA ^ byteB;
        }

        // 3. 返回结果（只有所有字节都相同且长度相同才返回 true）
        return result === 0;
    }

    compare(str1, str2) {
        // 转换为 Uint8Array 确保字节级比较
        const a = new TextEncoder().encode(str1);
        const b = new TextEncoder().encode(str2);

        return this.compareBytes(a, b);
    }

    compareHex(hex1, hex2) {
        // 十六进制字符串比较前先转换为小写
        const a = hex1.toLowerCase();
        const b = hex2.toLowerCase();

        return this.compare(a, b);
    }

    compareBase64(base64_1, base64_2) {
        // Base64 比较要确保 padding 一致
        const a = base64_1.replace(/=+$/, '');
        const b = base64_2.replace(/=+$/, '');

        return this.compare(a, b);
    }
}
