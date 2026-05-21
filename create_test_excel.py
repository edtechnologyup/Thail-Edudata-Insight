import openpyxl

wb = openpyxl.Workbook()
ws = wb.active
ws.append(["title", "description", "license"])
ws.append(["Dataset 1", "คำอธิบาย 1", "open"])
ws.append(["Dataset 2", "คำอธิบาย 2", "open"])
wb.save("test_bulk.xlsx")
