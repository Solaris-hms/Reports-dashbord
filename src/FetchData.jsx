
// --- API Data Fetching Functions ---

const API_KEY_CURRENTSTOCK = "https://script.googleusercontent.com/a/macros/solarisrecycling.com/echo?user_content_key=AehSKLgo6GQyGwRjo7sR-AxzvL2wngVhVAd7muatl5ifrAH6323pg9dM4p5rLQbfCiRVNcXTLs-TyVN0jrUOzGc6FBrgFvFU-fXqljv6QcPX353a018fuPRwfiGZQaltx-HPRuUdgEg-7W4h1ZJ-2KbNDE2Wo-4jV1rGqYQQVquImDZ3J70P9BBF_ol0L9i_CAgl9J579XihesjJp4MQTuzlTExHXhuLNi6E62yTdGIW9G1KkNpZbNjU9VZ1YMOuYihY9pJLVz6ltMuUHQugI4aTQaqW7IWrsphSv-V57Xzd9KyyeeLL02KRMj_Ikap-O3XHfb2EriFq&lib=M3ZOT5y13ixuUdBXybYdVGw-EZNJJRj1N";
export const stockapidata = async () => {
  try {
    const response = await fetch(API_KEY_CURRENTSTOCK, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stock data:', error);
    return null;
  }
};

const API_KEY_WORKFORCE = "https://script.googleusercontent.com/a/macros/solarisrecycling.com/echo?user_content_key=AehSKLgy98EHBgzqomj_nj45-V1EgVXpFfrp9aHE99tOW-lOUs_Y1fmjMQo-9kfTj5K7fJboW80rhqq-lG6EgJUMGiV41gUOR3b_GttU2mSd9aUQ3D2MFlbfHTbNo_hJMOeQYopD_1LRUpZu8Ws49Vy8-uzE16LvjexAKhbCQKw59OGfdhN1RHiMVOn71lx6GAxsR_fP1rf-NCSSoIC5jBSCy0Vzyu_wYXPUu3iegpwpIwSMKmUNX5ZsmlpVyD0G51vndh8E3m7MTE1tlfADK_S0J_lPlkFNl-s5Cnokhl6n7o9X_UsMHTn-nw8AA0PDRQ&lib=MeYUsD86HeVNqRvMi-V6FVz0n0t-AzCMt";
export const workapidata = async () => {
  try {
    const response = await fetch(API_KEY_WORKFORCE, { method: 'GET' });
    if (!response.ok) throw new Error(`Workforce API HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch workforce data:', error);
    return null;
  }
};

const API_KEY_PLANTREPORT="https://script.googleusercontent.com/a/macros/solarisrecycling.com/echo?user_content_key=AehSKLgqa3ZAQZhZGRlg1doBYAMlO4r24HKhmfoxwk1A_32ZpfuB4V-f9Ew6t6SV75B08KL14fqgeW2qrzr1-zmtaIPxoJi4MyHGzbmQ8nMnz5gwkUNHDYJBHGceUY7aY4egIFtgOLxBAqjct-lOyyAaPvJMPNjwefym4zp4VdwFsouKRit8kx6EEgVP_2Rmsz2tceQsVnrPU4SMy4gxElOstJF9E7LGyWJzFK0VZrdEIZzPDBWJArHkHNhh58yMR9Up-hmRamzX19DoZnY2uWfhsM4rs_85NqFt5j_LEWBMrilPfjp_vqlCH3VvujUB3qqhdrnE4eeU&lib=MMcIzW_rSNRaNNTefG9Wyo-Er7TuSKAlW";
export const plantdata = async () => {
  try {
    const response = await fetch(API_KEY_PLANTREPORT, { method: 'GET' });
    if (!response.ok) throw new Error(`PLANT API HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Plant data:', error);
    return null;
  }
};

const API_KEY_REVENUE="https://script.googleusercontent.com/a/macros/solarisrecycling.com/echo?user_content_key=AehSKLhYdmDoSelK9JRGnoCQVlHWdTE3ETMQXXZiHTA9laPtHwzbMsf_SPxLE0dHYseJlViqTq3_G_VScQ-xTLCOHZx4wrlR6CUvAMksjZ0VNPEZp63CDdUyiGeKbQAwHgGw0LpkVTdgLZAFd2R6zyQScje_uj245W53vlkrqJ92RU6Yc1rGEImUlWWJa7MqLWfdlWCOGDOoeNmf9im1DnNUDnQ1hq-KZ1k7UGrJG3EjhMu8jnX-IZSKnc9GJxdKL2uU25kRe0XJuhh6WavG0s0_vijyVJO13AypNNopkXfz5sGEr0QZ7Ix_47nG5OFKGDocqRgElKSU&lib=M_cOU7Oo03vtxO_afWH8WxOEr7TuSKAlW";
export const revdata = async () => {
  try {
    const response = await fetch(API_KEY_REVENUE, { method: 'GET' });
    if (!response.ok) throw new Error(`REVENUE API HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Revenue data:', error);
    return null;
  }
};

const API_KEY_BELT = 'https://script.google.com/macros/s/AKfycbyO-x3pEihYFlEsAWPJQLj1GJ1ptyvxUYQWrnuw_ZWYM_5kNQyZro2D5RGq9BYfDnDp/exec';
export const beltapidata = async () => {
  try {
    const promises = ['1', '2', '3'].map(beltId => 
      fetch(`${API_KEY_BELT}?belt=${beltId}`).then(res => res.json())
    );
    const results = await Promise.all(promises);
    return results.reduce((acc, result) => {
        if (result.status === 'success' && Array.isArray(result.data)) {
            return [...acc, ...result.data];
        }
        return acc;
    }, []);
  } catch (error) {
    console.error('Failed to fetch belt data:', error);
    return null;
  }
};

const API_KEY_SALES = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLh-OmrS2P7RqBQ5cxCWJHto7BTn3uAuw-saCbqLI9grw67eiKhssA1UdP-aJwFA8Y99HQvVvg2F4vKuchSioW4IiNLo-mGUI4YWeCVSLx44v0drVdDFpnVlhJKlfefmZa_c1le7xXc_A1F51FBPBr19C2qG3aa7ixqlf6hhw9QcE_HSAfih913wvgid_-ijpQOeiR0vg1xadyY3X123dL-u1eMI-w7MNJRegMssYMCUaxjbB30u6XA6Ww3H4aT1aoGvtUpS41KTUTKPMBm2-UKRsUYugQ&lib=MKgFLAYqjgOWhYOJZbwWsEHjOEwsImfFF";

// *** FIXED & IMPROVED salesapidata function ***
export const salesapidata = async () => {
  try {
    const response = await fetch(API_KEY_SALES, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`SALES API HTTP error! Status: ${response.status}`);
    }
    const rawData = await response.json();

    const cleanAndCombine = (dataArray, type) => {
      return dataArray
        .filter(row => row['S.N']) 
        .map(row => {
          const cleanRow = {};
          for (const key in row) {
            cleanRow[key.trim()] = row[key];
          }

          if (type === 'segregated') {
            return {
              id: cleanRow['S.N'],
              date: cleanRow.DATE,
              partyName: cleanRow['PARTY NAME'],
              vehicleNo: cleanRow['VEHICLE NO'],
              driverName: cleanRow['DRIVER NAME'],
              material: cleanRow['MATERIAL NAME'],
              driverMobile: cleanRow['DRIVER MOBILE NO'],
              emptyWeight: cleanRow['EMPTY VEHCILE'],
              loadedWeight: cleanRow['LOADED VEHCILE'],
              netWeightKg: Number(cleanRow['NET WEIGHT']) || 0,
              rate: Number(cleanRow.RATE) || 0,
              gst: cleanRow.GST,
              amount: Number(cleanRow.AMOUNT) || 0,
              totalAmountWithGst: Number(cleanRow['Total amount with GST']) || 0,
              paymentMode: cleanRow['MODE OF PAYMENT'],
              remark: cleanRow.REMARK,
              type: 'Segregated',
            };
          } else { // RDF/AFR
            return {
              id: cleanRow['S.N'],
              date: cleanRow.Date,
              partyName: cleanRow['Party Name'],
              vehicleNo: cleanRow['Vehicle No.'] || null,
              driverName: null,
              material: cleanRow['Material Name'],
              driverMobile: null,
              emptyWeight: null,
              loadedWeight: null,
              netWeightKg: (Number(cleanRow['Net Weight']) || 0) * 1000,
              rate: Number(cleanRow.Rate) || 0,
              gst: null,
              amount: Number(cleanRow.Amount) || Number(cleanRow['Biling Amount']) || 0,
              totalAmountWithGst: Number(cleanRow.Amount) || Number(cleanRow['Biling Amount']) || 0,
              paymentMode: 'bill', // Assume RDF is always billed
              remark: null,
              type: 'RDF/AFR',
            };
          }
        });
    };

    const segregated = cleanAndCombine(rawData['SEGRIGATE SALE'] || [], 'segregated');
    const rdfAfr = cleanAndCombine(rawData[' RDF AFR Record all location '] || [], 'rdfAfr');
    
    return [...segregated, ...rdfAfr];

  } catch (error) {
    console.error('Failed to fetch or process Sales data:', error);
    return null; 
  }
};