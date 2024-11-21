import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const BeverageSchemaFormData = zfd.formData({
  id: zfd.text().optional(),
  name: zfd.text(),
  style: zfd.text(),
  abv: zfd.numeric(z.number().positive()),
  description: zfd.text(),
  producer_id: zfd.text(),
});
