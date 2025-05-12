// stockapidata.js

const API_KEY_CURRENTSTOCK = "https://script.googleusercontent.com/a/macros/solarisrecycling.com/echo?user_content_key=AehSKLgo6GQyGwRjo7sR-AxzvL2wngVhVAd7muatl5ifrAH6323pg9dM4p5rLQbfCiRVNcXTLs-TyVN0jrUOzGc6FBrgFvFU-fXqljv6QcPX353a018fuPRwfiGZQaltx-HPRuUdgEg-7W4h1ZJ-2KbNDE2Wo-4jV1rGqYQQVquImDZ3J70P9BBF_ol0L9i_CAgl9J579XihesjJp4MQTuzlTExHXhuLNi6E62yTdGIW9G1KkNpZbNjU9VZ1YMOuYihY9pJLVz6ltMuUHQugI4aTQaqW7IWrsphSv-V57Xzd9KyyeeLL02KRMj_Ikap-O3XHfb2EriFq&lib=M3ZOT5y13ixuUdBXybYdVGw-EZNJJRj1N"
export const stockapidata = async () => {
  try {
    const response = await fetch(API_KEY_CURRENTSTOCK, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stock data:', error);
    return null;
  }
};

const API_KEY_WORKFORCE = "https://script.googleusercontent.com/a/macros/solarisrecycling.com/echo?user_content_key=AehSKLgy98EHBgzqomj_nj45-V1EgVXpFfrp9aHE99tOW-lOUs_Y1fmjMQo-9kfTj5K7fJboW80rhqq-lG6EgJUMGiV41gUOR3b_GttU2mSd9aUQ3D2MFlbfHTbNo_hJMOeQYopD_1LRUpZu8Ws49Vy8-uzE16LvjexAKhbCQKw59OGfdhN1RHiMVOn71lx6GAxsR_fP1rf-NCSSoIC5jBSCy0Vzyu_wYXPUu3iegpwpIwSMKmUNX5ZsmlpVyD0G51vndh8E3m7MTE1tlfADK_S0J_lPlkFNl-s5Cnokhl6n7o9X_UsMHTn-nw8AA0PDRQ&lib=MeYUsD86HeVNqRvMi-V6FVz0n0t-AzCMt";

export const workapidata = async () => {
  try {
    const response = await fetch(API_KEY_WORKFORCE, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Workforce API HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch workforce data:', error);
    return null;
  }
};
const API_KEY_PLANTREPORT="https://script.googleusercontent.com/a/macros/solarisrecycling.com/echo?user_content_key=AehSKLgqa3ZAQZhZGRlg1doBYAMlO4r24HKhmfoxwk1A_32ZpfuB4V-f9Ew6t6SV75B08KL14fqgeW2qrzr1-zmtaIPxoJi4MyHGzbmQ8nMnz5gwkUNHDYJBHGceUY7aY4egIFtgOLxBAqjct-lOyyAaPvJMPNjwefym4zp4VdwFsouKRit8kx6EEgVP_2Rmsz2tceQsVnrPU4SMy4gxElOstJF9E7LGyWJzFK0VZrdEIZzPDBWJArHkHNhh58yMR9Up-hmRamzX19DoZnY2uWfhsM4rs_85NqFt5j_LEWBMrilPfjp_vqlCH3VvujUB3qqhdrnE4eeU&lib=MMcIzW_rSNRaNNTefG9Wyo-Er7TuSKAlW"
export const plantdata = async () => {
  try {
    const response = await fetch(API_KEY_PLANTREPORT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`PLANT API HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch Plant data:', error);
    return null;
  }
};
const API_KEY_REVENUE="https://script.googleusercontent.com/a/macros/solarisrecycling.com/echo?user_content_key=AehSKLhYdmDoSelK9JRGnoCQVlHWdTE3ETMQXXZiHTA9laPtHwzbMsf_SPxLE0dHYseJlViqTq3_G_VScQ-xTLCOHZx4wrlR6CUvAMksjZ0VNPEZp63CDdUyiGeKbQAwHgGw0LpkVTdgLZAFd2R6zyQScje_uj245W53vlkrqJ92RU6Yc1rGEImUlWWJa7MqLWfdlWCOGDOoeNmf9im1DnNUDnQ1hq-KZ1k7UGrJG3EjhMu8jnX-IZSKnc9GJxdKL2uU25kRe0XJuhh6WavG0s0_vijyVJO13AypNNopkXfz5sGEr0QZ7Ix_47nG5OFKGDocqRgElKSU&lib=M_cOU7Oo03vtxO_afWH8WxOEr7TuSKAlW"
export const revdata = async () => {
  try {
    const response = await fetch(API_KEY_REVENUE, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`REVENUE API HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch Revenue data:', error);
    return null;
  }
};