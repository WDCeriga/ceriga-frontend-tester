import { IOrderState } from "@interfaces/bll/order.interface";
import { IParamPreviewOrder } from "@interfaces/order/paramsPreview.interface";

export const mapOrderStateToParams = async (state: IOrderState) => {
  const currentId = state.draftId ?? state._id;

  // Fetch the data and filter the names based on currentId
  const fetchDesignLink = async () => {
    try {
      const response = await fetch('https://storage.googleapis.com/storage/v1/b/ceriga-storage-bucket/o/');
      const responseData = await response.json(); // Renamed to responseData

      const names = responseData.items.map(item => item.name);
      const filteredNames = names.filter(name => name.includes(`${currentId}/designUploads`));
      console.log("Filtered Names:", filteredNames);

      // Assuming you want to use the first matching name for the design link
      return filteredNames.length > 0 ? `https://storage.googleapis.com/ceriga-storage-bucket/${filteredNames[0]}` : '';
    } catch (error) {
      console.error('Error fetching data:', error);
      return ''; // Returning empty string if fetch fails
    }
  };

  // Order data, now outside the fetch function
  const orderData: IParamPreviewOrder[] = [
    {
      title: "Fabrics",
      paramsType: "list",
      subparameters: [
        { title: "Materials", value: state.material.name || "" },
        { title: "GSM", value: state.material.value || "" },
      ],
    },
    {
      title: "Colour",
      paramsType: "list",
      subparameters: [
        { title: "Hex Code", value: state.color.hex || "" },
        { title: "Color Description", value: state.color.description || "" },
        { title: "Dye style", value: state.dyeStyle || "" },
        { title: "Extra details", value: state.stitching.description || "" },
      ],
    },
    {
      title: "Neck label",
      paramsType: "list",
      subparameters: [
        {
          title: "Design",
          isLink: true,
          link: `https://storage.googleapis.com/ceriga-storage-bucket/${currentId}/neckUploads/`,
        },
        {
          title: "Design Options",
          value: state.neck.additional.material || "",
        },
        { title: "Neck Label Description", value: state.neckDescription || "" },
        { title: "Material", value: state.neck.additional.material || "" },
        { title: "Colour", value: state.neck.additional.color || "" },
      ],
    },
    {
      title: "Care label",
      paramsType: "list",
      subparameters: [
        {
          title: "",
          isLink: true,
          titleStyle: "bold",
          link: `https://storage.googleapis.com/ceriga-storage-bucket/${currentId}/labelUploads/`,
        },
      ],
    },
    {
      title: "Design",
      paramsType: "list",
      subparameters: [
        {
          title: "Design",
          isLink: true,
          titleStyle: "bold",
          link: "", // This will be updated after fetch
        },
        { title: "Extra Details", value: state.stitching.description || "" },
        { title: "Stitching", value: state.stitching.type || "" },
        { title: "Custom Stitching", value: "" },
        { title: "Fading", value: state.fading.type || "" },
        { title: "Custom Fading", value: "" },
      ],
    },
    {
      title: "Packaging",
      paramsType: "list",
      subparameters: [
        {
          title: "Packaging Type",
          value: state.package.isPackage ? "Packaged" : "Unpackage",
        },
        { title: "Extra Details", value: state.package.description || "" },
        {
          title: "Images",
          isLink: true,
          titleStyle: "bold",
          link: `https://storage.googleapis.com/ceriga-storage-bucket/${currentId}/packageUploads/`,
        },
      ],
    },
    {
      title: "Quantity",
      paramsType: "table",
      subparameters: state.quantity.list.map((item) => ({
        title: item.name,
        value: item.value.toString(),
      })),
    },
  ];

  // Fetch the design link and update the 'Design' part
  const designLink = await fetchDesignLink(); // Wait for the design link to be fetched
  console.log(designLink);
  
  // Update the Design link after fetching the data
  orderData[4].subparameters[0].link = designLink;

  console.log("Updated Order Data:", orderData);
  // console.log(orderData[4].subparameters[0].link);

  // Return order data with updated design link
  return orderData;
};
